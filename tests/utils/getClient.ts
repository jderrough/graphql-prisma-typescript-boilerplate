import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink, Observable, Operation, NextLink, RequestHandler, FetchResult } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { Subscription } from 'apollo-client/util/Observable';
import { OperationDefinitionNode, FragmentDefinitionNode } from 'graphql';

function getClient(
    jwt?: string,
    httpURL: string = 'http://localhost:4000',
    websocketURL: string = 'ws://localhost:4000'
): ApolloClient<NormalizedCacheObject> {
    // Setup the authorization header for the http client
    function request(operation: Operation): void {
        if (jwt) {
            operation.setContext({
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });
        }
    }

    // Setup the request handlers for the http clients
    const requestLink: ApolloLink = new ApolloLink((operation: Operation, forward: NextLink): Observable<FetchResult> => {
        // tslint:disable-next-line: typedef
        return new Observable<FetchResult>((observer) => {
            let handle: Subscription;
            Promise.resolve(operation)
                .then((oper) => {
                    request(oper);
                })
                .then(() => {
                    handle = forward(operation).subscribe({
                        next: observer.next.bind(observer),
                        error: observer.error.bind(observer),
                        complete: observer.complete.bind(observer),
                    });
                })
                .catch(observer.error.bind(observer));

            return (): void => {
                if (handle) {
                    handle.unsubscribe();
                }
            };
        });
    });

    // Web socket link for subscriptions
    const wsLink: ApolloLink = ApolloLink.from([
        onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors) {
                graphQLErrors.map(({ message, locations, path }) =>
                    console.warn(
                        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                    ),
                );
            }

            if (networkError) {
                console.warn(`[Network error]: ${networkError}`);
            }
        }),
        requestLink,
        new WebSocketLink({
            uri: websocketURL,
            options: {
                reconnect: true,
                connectionParams: () => {
                    if (jwt) {
                        return {
                            Authorization: `Bearer ${jwt}`,
                        };
                    }
                }
            }
        })
    ]);

    // HTTP link for queries and mutations
    const httpLink: ApolloLink = ApolloLink.from([
        onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors) {
                graphQLErrors.map(({ message, locations, path }) =>
                    console.warn(
                        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                    ),
                );
            }
            if (networkError) {
                console.warn(`[Network error]: ${networkError}`);
            }
        }),
        requestLink,
        new HttpLink({
            uri: httpURL,
            credentials: 'same-origin'
        })
    ]);

    // Link to direct ws and http traffic to the correct place
    const link: ApolloLink = ApolloLink.split(
        // Pick which links get the data based on the operation kind
        ({ query }) => {
            const definition: OperationDefinitionNode | FragmentDefinitionNode = getMainDefinition(query);

            return definition.kind === 'OperationDefinition' &&
                (definition.operation && definition.operation === 'subscription');
        },
        wsLink,
        httpLink,
    );

    return new ApolloClient({
        link,
        cache: new InMemoryCache()
    });
}

export { getClient as default };
