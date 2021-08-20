import { useEffect, useState } from "react";
import './app.css';
import ReactMapGL, { Marker, Popup,NavigationControl } from "react-map-gl";
import { Room, Star, StarBorder, FiberManualRecord } from "@material-ui/icons";
import axios from "axios";
import { formatMs } from "@material-ui/core";
import { format } from "timeago.js";
// import Register from "./components/Register";
// import Login from "./components/Login";

// NYC:
const INITIAL_VIEWPORT = {
  latitude: 40.730824,
  longitude: -73.997330,
  zoom: 11
}

// HNL:
// const INITIAL_VIEWPORT = {
//   latitude: 21.315603,
//   longitude: -157.858093,
//   zoom: 13
// }

function App() {
  const currentUser = 'panda';
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState(null);
  const [spots, setSpots] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);

  const handleSpotClick = (id, lat, lon) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: lon })
  }

  useEffect(() => {
    const getSpots = async () => {
      try {
        const spots = await axios.get('/spots');
        console.log('spots?', spots)
        setSpots(spots.data);
      } catch (error) {
        console.log(error);
      }
    }
    getSpots();
  }, [])


  useEffect(() => {
    getUserPosition();
  }, [])

  const getUserPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setViewport({ 
          ...viewport, 
          latitude, 
          longitude 
        });
        setUserPosition({
          latitude,
          longitude
        })
      })
    }
  }

  return (
    <div>
      <h1>NasaLite's OutsInAbouts</h1>
      <ReactMapGL
        width='100vw'
        height='100vh'
        transitionDuration="200"
        mapStyle='mapbox://styles/mapbox/light-v10'
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange={newViewport => setViewport(newViewport)}
        // onClick={handleMapClick}
        {...viewport}
        // onViewportChange={nextViewport => setViewport(nextViewport)}
      >
        <div>
          <NavigationControl
            onViewportChange={newViewport => setViewport(newViewport)}
          />
        </div>
        {spots.map(spot => (
          <>
            <Marker
                latitude={spot.lat}
                longitude={spot.lon}
                // offsetLeft={-20}
                // offsetRight={-10}
              >
                <FiberManualRecord 
                  style={{
                    fontSize: 2 * viewport.zoom,
                    color: spot.username === currentUser ? 'lightseagreen' : 'slateblue', 
                    cursor: 'pointer',
                  }}
                  onClick={() => handleSpotClick(spot._id, spot.lat, spot.lon)}
                />
              </Marker>
              
              {spot._id === currentPlaceId && (
              
              <Popup
                latitude={spot.lat}
                longitude={spot.lon}
                closeButton={true}
                closeOnClick={false}
                onClose={() => setCurrentPlaceId(null)}
                anchor='bottom'
              >
                <div className='card'>
                  <label>Place</label>
                  <h4 className='place'>{spot.title}</h4>
                  <label>Review</label>
                  <p className='desc'>{spot.description}</p>
                  <label>Rating</label>
                  <div className='stars'>
                    <Star className='star' />
                    <Star className='star' />
                    <Star className='star' />
                    <Star className='star' />
                  </div>
                  <label>Information</label>
                  <span className='username'>
                    Created by <b>{spot.username}</b>
                  </span>
                  <span className='date'>{format(spot.createdAt)}</span>
                </div>
              </Popup>
              )}
          </>
        ))}

        
      </ReactMapGL>
    </div>
  );
}

export default App;
