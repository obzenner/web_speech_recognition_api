import "./App.css";
import React, { useEffect, useState } from 'react';

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

const enableSpeechRecognition = () => {
  const genres = [
    "thriller",
    "science fiction",
    "drama",
    "animation",
    "action",
    "comedy"
  ];
  const grammar =
    "#JSGF V1.0; grammar genres; public <genre> = " + genres.join(" | ") + " ;";

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechGrammarList = window.window.SpeechGrammarList || window.webkitSpeechGrammarList;
  const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);

  recognition.grammars = speechRecognitionList;
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onspeechend = function() {
    recognition.stop();
  }

  return recognition;
};

const getMoviesPerTranscript = (transcript) => {
  const newMovies = allMoviesArray.filter(movie => {
    const movieGenres = movie.value._links['viaplay:genres'].map(genre => {
      let title = '';
      // TODO: make a config with all genres
      if (genre.title === 'Komedi') {
        title = 'comedy'
      } else {
        title = genre.title
      }
      return title.toLowerCase();
    });
    
    if (movieGenres.includes(transcript)) {
      return movie;
    }
  });

  return newMovies;
};

function App() {
  const [recognition, setSpeech] = useState(null);
  const [movies, setMovies] = useState([]);

  const renderContent = (event) => {
    const transcript = event.results[0][0].transcript;
    const newMovies = getMoviesPerTranscript(transcript)
    setMovies(newMovies)
  }

  useEffect(() => {
   setSpeech(enableSpeechRecognition());
  }, [])

  return (
    <div className="App" >
      <button onClick={() => {
        recognition.start()
        recognition.onresult = function(event) {
          renderContent(event)
        }
        }}>Say what to watch!</button>
        {movies.map(movie => <p>{movie.name}</p>)}
    </div>
  );
}

export default App;
