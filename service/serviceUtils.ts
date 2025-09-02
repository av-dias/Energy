const fetchWithTimeout = async (url: string, options = {}, timeout = 2000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: any) {
    console.log(error);
  } finally {
    clearTimeout(id);
  }
};

export { fetchWithTimeout };
