
// check for Geolocation support
const getLocation = () => {
  if (navigator.geolocation) {
    console.log('Navegador com suporte a geolocalizão!');

    setInterval(() => {
      navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    }, 5000);
  } else {
    console.log('Navegador sem suporte a geolocalizão!');
  }
};

getLocation();

const geoSuccess = pos => {
  const base = {
    latitude: 55.755826,
    longitude: 37.6173
  };

  console.log(`lat: ${pos.coords.latitude} || long: ${pos.coords.longitude}`);

  const distance = geoDistance(
    base.latitude,
    base.longitude,
    pos.coords.latitude,
    pos.coords.longitude,
    'K'
  );

  if (distance) {
    console.log(
      'Disparar POST para API enviar push com os dados do usuario + token push'
    );
  }

  storage(pos);
};

const geoError = error => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Usuário negou a solicitação de Geolocation.';
      break;
    case error.POSITION_UNAVAILABLE:
      return 'As informações de localização não estão disponíveis.';
      break;
    case error.TIMEOUT:
      return 'O pedido para obter a localização do usuário expirou.';
      break;
    case error.UNKNOWN_ERROR:
      return 'Ocorreu um erro desconhecido.';
      break;
  }
};

const geoDistance = (lat1, lon1, lat2, lon2, unit) => {
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;

  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;

  if (unit == 'K') {
    dist = dist * 1.609344;
  }

  let result = false;

  if (dist < 0.3) {
    result = true;
  }

  return result;
};

const storage = position => {
  if (typeof Storage !== 'undefined') {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    window.localStorage.setItem('coords', JSON.stringify(coords));

    const getCoods = JSON.parse(window.localStorage.getItem('coords'));
  } else {
    // No web storage Support.
  }
};

const onPushNotification = async () => {
  try {
    const messaging = firebase.messaging();
    await messaging.requestPermission();
    const token = await messaging.getToken();
    console.log('token do usuário:', token);
    // window.localStorage.setItem('dateUser', JSON.stringify(dateUser));
    document.getElementById('tokenFB').innerHTML = token;

    return token;
  } catch (error) {
    console.error(error);
  }
};

const onGetUser = () => {
  startPreloader();

  const url =
    'http://gastrovita.hostess.digital:81/agenda/get-procedure-service-type-json/';
  const id = parseInt(document.getElementById('id').value);

  axios
    .get(`${url}`)
    .then(response => {
      showResult(response.data);
      console.log(response.data);
      window.localStorage.setItem('user', JSON.stringify(response.data));
    })
    .catch(error => {
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').innerHTML = 'Erro inesperado';
    })
    .finally(() => endPreloader());

  event.preventDefault();
};

const onShowNewUser = () => {
  document.getElementsByClassName('form-search')[0].style.display = 'none';
  document.getElementsByClassName('form-new')[0].style.display = 'block';
};

const onAddUser = () => {
  const pathUrl =
    'https://my-json-server.typicode.com/filiperaiz/pwa_db/users';

  axios
    .post(pathUrl, {
      id: parseInt(document.getElementById('userId').value),
      name: document.getElementById('userName').value,
      age: document.getElementById('userAge').value
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });

  document.getElementsByClassName('form-search')[0].style.display = 'block';
  document.getElementsByClassName('form-new')[0].style.display = 'none';

  event.preventDefault();
};

const showResult = user => {
  document.getElementById('result').style.display = 'block';

  document.getElementById('result').innerHTML = `
      <ul class="list-group text-left">
        <li class="list-group-item"><img src="${user.image}" alt=""></li>
        <li class="list-group-item"><b>Id: </b>${user.id}</li>
        <li class="list-group-item"><b>Nome: </b>${user.name}</li>
        <li class="list-group-item"><b>Idade: </b>${user.age}</li>
      </ul>
   `;
};

const startPreloader = () => {
  document.getElementById('preloader').style.display = 'block';
  document.getElementById('result').innerHTML = '';
  document.getElementById('result').style.display = 'none';
  document.getElementById('error').style.display = 'none';
};

const endPreloader = () => {
  document.getElementById('preloader').style.display = 'none';
};
