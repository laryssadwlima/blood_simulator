document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.getElementById('searchForm');
  const cepInput = document.getElementById('cep');
  const mapContainer = document.getElementById('map');
  const resultsContainer = document.getElementById('results');
  let map;
  let markers = [];
  let geocoder;

  function initMap() {
    const defaultLocation = { lat: -23.550520, lng: -46.633308 }; // São Paulo
    map = new google.maps.Map(mapContainer, {
      zoom: 12,
      center: defaultLocation
    });
    geocoder = new google.maps.Geocoder();89035-300
  }


  function validateCEP(cep) {
    return /^\d{5}-?\d{3}$/.test(cep);
  }

  // Busca o endereço pelo CEP
  async function getAddressByCEP(cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) throw new Error('CEP não encontrado');
      return data;
    } catch (error) {
      throw new Error('Erro ao buscar CEP');
    }
  }

  async function getCoordinatesNominatim(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } else {
      throw new Error('Não foi possível converter o endereço em coordenadas');
    }
  }

  async function buscarHemocentrosPorCoordenada(lat, lon, cep) {
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(
      node["amenity"="hospital"](around:5000,${lat},${lon});
      node["name"~"banco de sangue",i](around:10000,${lat},${lon});
      node["name"~"hemocentro",i](around:10000,${lat},${lon});
       node["name"~"hemos",i](around:10000,${lat},${lon});
      node["name"~"hemocentro ${cep}",i](around:10000,${lat},${lon});
    );out;`;
    const response = await fetch(overpassUrl);
    const data = await response.json();
    return data.elements;
  }

  function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  }

  function addMarker(position, title) {
    const marker = new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      animation: google.maps.Animation.DROP
    });
    markers.push(marker);
    return marker;
  }

  function displayResults(places, userLocation) {
    resultsContainer.innerHTML = '';
    if (!places || places.length === 0) {
      resultsContainer.innerHTML = `
        <div class="location-card">
          <p>Nenhum hemocentro ou hospital encontrado próximo a este endereço.</p>
          <p>Você pode tentar:</p>
          <ul>
            <li>Buscar em um raio maior</li>
            <li>Verificar a ortografia do CEP</li>
            <li>Consultar o site da sua região</li>
          </ul>
        </div>
      `;
      return;
    }
    places.forEach(place => {
      const card = document.createElement('div');
      card.className = 'location-card';
      const lat = place.lat;
      const lon = place.lon;
      const name = place.tags && place.tags.name ? place.tags.name : 'Hemocentro/Hospital';
      const address = place.tags && place.tags['addr:street'] ? place.tags['addr:street'] : '';
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + address)}`;
      let distance = '';
      if (userLocation) {
        const R = 6371; // km
        const dLat = (lat - userLocation.lat) * Math.PI / 180;
        const dLon = (lon - userLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = (R * c).toFixed(1) + ' km';
      }
      card.innerHTML = `
        <div class="location-info">
          <h3>${name}</h3>
          <p>${address}</p>
          <p class="distance">${distance ? 'Distância: ' + distance : ''}</p>
        </div>
        <div class="location-actions">
          <a href="${mapsUrl}" target="_blank" class="btn-maps">
            <i class="fas fa-map-marker-alt"></i>
            Ver no Maps
          </a>
        </div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const cep = cepInput.value.replace(/\D/g, '');
    if (!validateCEP(cep)) {
      alert('Por favor, digite um CEP válido');
      return;
    }
    try {
      resultsContainer.innerHTML = `
        <div class="location-card" style="text-align:center;">
          <div class="spinner" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #eee; border-top: 4px solid #c40000; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p>Buscando locais de doação próximos</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }</style>
      `;

      const addressData = await getAddressByCEP(cep);
      const fullAddress = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade} - ${addressData.uf}`;
      const userLocation = await getCoordinatesNominatim(fullAddress);
      map.setCenter(userLocation);
      clearMarkers();
      addMarker(userLocation, 'Sua localização');
      const places = await buscarHemocentrosPorCoordenada(userLocation.lat, userLocation.lng, cep);
      places.forEach(place => {
        if (place.lat && place.lon) {
          addMarker({lat: place.lat, lng: place.lon}, place.tags && place.tags.name ? place.tags.name : 'Hemocentro/Hospital');
        }
      });
      displayResults(places, userLocation);
    } catch (error) {
      console.error('Erro completo:', error);
      resultsContainer.innerHTML = `
        <div class="location-card">
          <p>Erro: ${error.message}</p>
          <p>Por favor, tente novamente ou consulte o site da sua região.</p>
        </div>
      `;
    }
  });
  cepInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value;
  });

  initMap();
}); 