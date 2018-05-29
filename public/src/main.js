
class App {
  constructor(rootNode, apiKey) {
    this.API_KEY_QUERY = `api_key=${apiKey}`;

    /**
     * Some sort of basic state
     */
    this.state = {
      selectedGenres: [],
      movies: [],
      genres: [],
    }

    /**
     * UI Elements
     */
    this.rootNode = rootNode;
    this.filtersContainer = this.rootNode.querySelector('[data-binding="filters"]');
    this.moviesContainer = this.rootNode.querySelector('[data-binding="movies"]');

    /**
     * Kickoff
     */
    this.bind();
    this.init();
  }

  bind() {
    /**
     * Delegate a click on the filtersContainer to listen for checkbox changes
     * Should probably listen for a change on each checkbox really
     */
    this.filtersContainer.addEventListener('click', (e) => {
      const target = e.target.closest('[data-binding="checkbox"]') || e.target;
      const id = parseInt(target.dataset.id, 10);

      if (target.checked) {
        /**
         * Update the current state by adding the selected genre
         */
        this.state.selectedGenres = [...this.state.selectedGenres, id];
      } else {
        /**
         * Remove the selected genre from the state
         */
        this.state.selectedGenres = this.state.selectedGenres.filter(filter => filter !== id);
      }

      if (this.state.selectedGenres.length) {
        this.filterMovies();
      } else {
        this.buildMoviesHtml(this.state.movies);
      }
    });
  }

  makeRequest(url) {
    return fetch(url)
      .then(resp => {
        return resp.json();
      })
  }

  buildFiltersHtml(genres) {
    this.filtersContainer.innerHTML = genres.map(genre => {
      return `<div style="display: inline-block;">
                <label for="${genre.id}">
                  <input id="${genre.id}" type="checkbox" data-binding="checkbox" data-id="${genre.id}">${genre.name}
                </label>
              </div>`;
    }).join('');
  }

  buildMoviesHtml(movies) {
    this.moviesContainer.innerHTML = movies.map(movie => {
      /**
       * Loop over the genre names to get html to render
       */
      const genreListHtml = movie.genre_names.map(genre => {
        return `<span>${genre}</span>`;
      }).join(', ');

      return `<div>
                <p>${movie.title}</p>
                <em>${genreListHtml}</em>
                <hr />
              </div>`;
    }).join('');
  }

  /**
   * Filters the movies in state and returns them if
   * the movie has a genre in the selectedGenres array
   */
  filterMovies() {
    const filteredMovies = this.state.movies.filter(movie => {
      for (let genre of movie.genre_ids) {
        if (this.state.selectedGenres.indexOf(genre) !== -1) {
          return movie;
        }
      }
    });

    /**
     * Re-render the movies list
     */
    this.buildMoviesHtml(filteredMovies);
  }

  initialRender() {
    this.buildFiltersHtml(this.state.genres);
    this.buildMoviesHtml(this.state.movies);
  }

  init() {
    /**
     * Make a request too the genre endpoint first
     * them the now playing endpoint
     */
    Promise.all([
      this.makeRequest(`//api.themoviedb.org/3/genre/movie/list?${this.API_KEY_QUERY}`),
      this.makeRequest(`//api.themoviedb.org/3/movie/now_playing?${this.API_KEY_QUERY}`)
    ]).then(([genres, nowPlaying]) => {

      /**
       * Set genres in state to build the filter UI from
       */
      this.state.genres = genres.genres;

      /**
       * Merge the movie results with the genres so each movie
       * has a 'genre_names' property
       */
      this.state.movies = nowPlaying.results.map(movie => {
        movie.genre_names = [];
        for (let genreId of movie.genre_ids) {
          const genreName = this.state.genres.filter(stateGenre => stateGenre.id === genreId);
          movie.genre_names.push(genreName[0].name);
        }
        return movie;
      });

      /**
       * Build the initial UI
       */
      this.buildFiltersHtml(this.state.genres);
      this.buildMoviesHtml(this.state.movies);
    }).catch(() => {
      console.log('Oh no, one of the requests or all of them failed.');
    })
  }
}
