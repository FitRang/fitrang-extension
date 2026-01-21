const FIREBASE_API_KEY = "AIzaSyCF330pJcqJAQgBR20dk-Gf21C8ORsyeV8";

export async function logIn(data) {
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email: data.email,
        password: data.password,
        returnSecureToken: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const {
      idToken,
      refreshToken,
      expiresIn,
      tokenType,
      localId,
      email,
    } = response.data;

    localStorage.setItem("access_token", idToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem(
      "access_token_expiry",
      (Date.now() + Number(expiresIn) * 1000).toString()
    );
    localStorage.setItem("token_type", tokenType || "Bearer");
    localStorage.setItem("uid", localId);
    localStorage.setItem("email", email);

    return;
  } catch (error) {
    const firebaseError = error?.response?.data?.error;

    let message = "Login failed. Please try again.";

    if (firebaseError) {
      switch (firebaseError.message) {
        case "EMAIL_NOT_FOUND":
          message = "Email not found.";
          break;
        case "INVALID_PASSWORD":
          message = "Invalid password.";
          break;
        case "USER_DISABLED":
          message = "This account has been disabled.";
          break;
        default:
          message = firebaseError.message;
      }
    }

    throw new Error(message);
  }
}
