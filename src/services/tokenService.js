export const setToken = token => {
  localStorage.setItem("icadDateToken", token);
};

export const getToken = () => {
  return localStorage.getItem("icadDateToken");
};

export const removeToken = () => {
  localStorage.removeItem("icadDateToken");
};
