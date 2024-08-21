type responseType = {
  error: string[];
  valid: boolean;
}


export default function passwordChecker(password: string) {
  const response : responseType = {
    error: [],
    valid: true,
  }
  if(password.length < 8) {
    response.error = [...response.error, "Password must be at least 8 characters long"];
    response.valid = false;
  }
  if(!/[a-z]/.test(password)) {
    response.error = [...response.error, "Password must contain at least one lowercase letter"];
    response.valid = false;
  }
  if(!/[A-Z]/.test(password)) {
    response.error = [...response.error, "Password must contain at least one uppercase letter"];
    response.valid = false;
  }
  if(!/[0-9]/.test(password)) {
    response.error = [...response.error, "Password must contain at least one number"];
    response.valid = false;
  }
  if(!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    response.error = [...response.error, "Password must contain at least one special character"];
    response.valid = false;
  }
  return response;
}