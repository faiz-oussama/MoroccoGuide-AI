import axios from 'axios';

const list = {
  method: 'GET',
  url: 'https://apidojo-booking-v1.p.rapidapi.com/properties/v2/list',
  params: {
    offset: '0',
    guest_qty: '1',
    dest_ids: '-3712125',
    room_qty: '1',
    search_type: 'city',
    price_filter_currencycode: 'MAD',
    order_by: 'popularity',
    languagecode: 'en-us',
    units: 'imperial'
  },
  headers: {
    'x-rapidapi-key': '34ef06ebe7mshb328da340021f84p1b40e8jsn9bd024b73686',
    'x-rapidapi-host': 'apidojo-booking-v1.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}


const photos = {
    method: 'GET',
    url: 'https://apidojo-booking-v1.p.rapidapi.com/properties/get-hotel-photos',
    params: {
      languagecode: 'en-us',
      hotel_ids: '1950932'
    },
    headers: {
      'x-rapidapi-key': '34ef06ebe7mshb328da340021f84p1b40e8jsn9bd024b73686',
      'x-rapidapi-host': 'apidojo-booking-v1.p.rapidapi.com'
    }
  };
  
  try {
      const response = await axios.request(options);
      console.log(response.data);
  } catch (error) {
      console.error(error);
  }



const scores = {
  method: 'GET',
  url: 'https://apidojo-booking-v1.p.rapidapi.com/reviews/get-scores',
  params: {
    hotel_ids: '264831',
    languagecode: 'en-us'
  },
  headers: {
    'x-rapidapi-key': '34ef06ebe7mshb328da340021f84p1b40e8jsn9bd024b73686',
    'x-rapidapi-host': 'apidojo-booking-v1.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}