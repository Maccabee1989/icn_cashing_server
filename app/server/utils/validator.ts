const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegexPattern =/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/;
export const passwordPolicy:string = `Password must contain at least one lower-letter, at least one Upper-letter,at least one digit, at least one special caracter {#?!@$%^&*-}`

export const isValidEmail = (value:string):boolean => {
    return emailRegexPattern.test(value);
}

export const isValidPassword = (value:string):boolean => {
    return passwordRegexPattern.test(value);
}
