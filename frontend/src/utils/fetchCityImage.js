const UNSPLASH_ACCESS_KEY = '2XoBrkFt-TvDGLMYH8hcitcKc8kKg-pvlNm_-l2ICHo';

export async function fetchCityImage(cityName) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${cityName}+cityscape&orientation=landscape&per_page=1&order_by=popular`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    const data = await response.json();
    return data.results[0]?.urls?.regular || null;
  } catch (error) {
    console.error('Error fetching city image:', error);
    return null;
  }
}