export const axiosErrorResponse = (status, reason) => ({
  response: {
    status,
    data: {
      error: {
        code: 404,
        errors: [{ reason }],
      },
    },
  },
});
