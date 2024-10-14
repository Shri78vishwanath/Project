
    mapboxgl.accessToken =mapToken;

    
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9// starting zoom

    });

    console.log(listing.geometry.coordinates)

    const marker = new mapboxgl.Marker({color:'red'})
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h4>${listing.location}</h4> <h5>exact location provided after booking!</h5>`))
        // .setMaxWidth("300px")
        .addTo(map);
