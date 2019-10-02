const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
}

const isValidPassword = (password: string) => {
    return password.length >= 8 && !password.toLowerCase().includes('password')
}

export { getFirstName, isValidPassword }