import "./App.css";
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import contentData from "./fixtures/content.json";
const allMovies = contentData._embedded['viaplay:blocks'].reduce((acc, block) => {
  const allMoviesPerBlock = block._embedded && block._embedded['viaplay:products'];
  if (!allMoviesPerBlock) {
    return acc;
  }
  allMoviesPerBlock.forEach(movie => {
    acc.set(movie._links.self.title, movie);
  })
  return acc;
}, new Map());
const allMoviesArray = [...allMovies].map(([name, value]) => ({ name, value }));

const allGenres = contentData._links['viaplay:categoryFilters'].reduce((acc, cat) => {
  let translation = '';
  switch (cat.title) {
    case "Action":
      translation = 'action';
      break;
    case "Animation":
      translation = 'animation';
      break;
    case 'Barnfilm':
      translation = 'kids';
      break;
    case 'Dokumentärfilm':
      translation = 'documentary';
      break;
    case 'Drama':
      translation = 'drama';
      break;
    case 'Familjefilm':
      translation = 'family';
      break;
    case 'Komedi':
      translation = 'comedy';
      break;
    case 'Kriminaldrama':
      translation = 'crime';
      break;
    case 'Romantik':
      translation = 'romance';
      break;
    case 'Rysare':
      translation = 'horror';
      break;
    case 'Science fiction':
      translation = 'science fiction';
      break;
    case 'Thriller':
      translation = 'thriller';
      break;
    case 'Äventyr':
      translation = 'adventure';
      break;
    default:
      translation = '';
      break;
  }

  if (translation === '') {
    return acc;
  } else {
    acc[translation] = cat.title
  }


  return acc;
}, {});

const MovieBlock = styled.div`
  display: flex;
  width: 800px;
  margin: auto;
  flex-wrap: wrap;
  justify-content: center;
  color: red;
`;

const Movie = styled.p`
  margin: 5px;
`;

const Genre = styled.h3`
  color: #ffffff;
`;

const SpeechButton = styled.button`
  background-color: ${props => props.active ? "red" : "#ff5bb0"};
  border-radius: 10px;
  height: 60px;
  width: 150px;
  border:1px solid #851467;
  display:inline-block;
  cursor:pointer;
  color:#ffffff;
  font-family:Arial;
  font-size:15px;
  font-weight:bold;
  padding:6px 24px;
  text-decoration:none;
  text-shadow:0px 1px 0px #c70067;
  margin-bottom: 20px;
`;

const ImagePlaceholder = styled.img``;
const ImagePlaceholderLogo = styled.img`
  display: block;
`;

const enableSpeechRecognition = () => {
  const genres = [
    'action',
    'animation',
    'kids',
    'documentary',
    'drama',
    'family',
    'comedy',
    'crime',
    'romance',
    'horror',
    'science fiction',
    'thriller',
    'adventure'
  ];
  const grammar =
    "#JSGF V1.0; grammar genres; public <genre> = " + genres.join(" | ") + " ;";

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechGrammarList = window.window.SpeechGrammarList || window.webkitSpeechGrammarList;
  // const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);

  recognition.grammars = speechRecognitionList;
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  return recognition;
};

const getMoviesPerTranscript = (transcript) => {
  const requestedGenre = allGenres[transcript];
  const newMovies = allMoviesArray.filter(movie => {
    const movieGenres = movie.value._links['viaplay:genres'].map(genre => genre.title);
    if (movieGenres.includes(requestedGenre)) {
      return movie;
    }
  });

  return newMovies;
};

function App() {
  const [recognition, setSpeech] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isSpeechActive, setSpeechActive] = useState(false);
  const [genre, setGenre] = useState('');

  const renderContent = (transcript) => {
    const newMovies = getMoviesPerTranscript(transcript)
    setMovies(newMovies)
  }

  useEffect(() => {
   setSpeech(enableSpeechRecognition());
  }, [])

  return (
    <div className="App" >
      <ImagePlaceholderLogo src="https://viaplay-web-frontend-assets.mtg-api.com/frontend-2021091627423/images/header-logo.png" />
      <SpeechButton active={isSpeechActive} onClick={() => {
        setSpeechActive(true);
        recognition.start()
        recognition.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          renderContent(transcript)
          setGenre(transcript);
          setSpeechActive(false)
        }
        recognition.onspeechend = function() {
          recognition.stop();
          setSpeechActive(false);
        }
        }}>Speak out your desired title!</SpeechButton>
        <Genre>{genre.toUpperCase()}</Genre>
        <MovieBlock>{movies.map(movie => <Movie key={movie.name}>
          <ImagePlaceholder src={movie.value.content.images.boxart.url}></ImagePlaceholder>
        </Movie>)}</MovieBlock>
    </div>
  );
}

export default App;
