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
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [description, setDescription] = useState(null);
  const [star, setStar] = useState(0);

  const handleSpotClick = (id, lat, lon) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: lon })
  }

  const handleAddClick = (e) => {
    const [lon, lat] = e.lngLat;
    setNewPlace({
      lat,
      lon
    })
  }

  // const handleMapClick = (e) => {

  // }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newSpot = {
      username: currentUser,
      title,
      description,
      rating: star,
      lat: newPlace.lat,
      lon: newPlace.lon
    }

    try {
      const resp = await axios.post('/spots', newSpot);
      setSpots([ ...spots, resp.data ]);
      setNewPlace(null);
    } catch (error) {
      console.log('Error:\n', error);
    }

  }

  useEffect(() => {
    const getSpots = async () => {
      try {
        const spots = await axios.get('/spots');
        console.log('spots?', spots, '\n\tVIEWPORT ZOOM:', viewport.zoom)
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

  const listStars = (rating) => {
    let starArr = [];
    for (let i = 0; i < rating; i++) {
      starArr.push(<Star key={i} className='star' />)
    }
    return starArr;
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
        onDblClick={handleAddClick}
        {...viewport}
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
                // offsetLeft={-viewport.zoom * 1}
                // offsetTop={-viewport.zoom * 3}
              >
                <FiberManualRecord 
                  style={{
                    fontSize: 3 * viewport.zoom,
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
                    {
                      listStars(spot.rating).map(star => star)
                    }
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


        {newPlace && (
          <>
            <Popup
            latitude={newPlace.lat}
            longitude={newPlace.lon}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setNewPlace(null)}
            anchor='left'
            >
              <div>
                <form onSubmit={handleSubmit}>
                  <label>Title</label>
                  <input
                    placeholder="Enter a Title"
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                    />
                  <label>Description</label>
                  <textarea 
                    placeholder="What's about this place?"
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <label>Rating</label>
                  <select onChange={(e) => setStar(e.target.value)}>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                  </select>
                  <button type="submit" className="submitButton">
                    Save Spot To Map
                  </button>
                </form>
              </div>
            </Popup>
          </>
        )}
        
      </ReactMapGL>
    </div>
  );
}

export default App;
