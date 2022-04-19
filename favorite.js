const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/movies/'
const POSTER_URL = BASE_URL + 'posters/'
const dataPanel = document.querySelector('#data-panel')
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

// 渲染 movie 頁面
function renderMovieList(data) {
  // 查看 dataPanel的客製化 mode屬性值 為 'card'/ 'list'
  if (dataPanel.dataset.mode === 'card') {
    cardMode(data)
  } else if (dataPanel.dataset.mode === 'list') {
    listMode(data)
  }
}
// 當點擊其中一個 icon 時，將其 id值 賦予 dataPanel的客製化mode屬性
const icons = document.querySelector('#icons')
icons.addEventListener('click', function onClickedIcon(event) {
  dataPanel.dataset.mode = event.target.id === 'card' ? 'card' : 'list'
  renderMovieList(movies)
})

// list: 清單模式
function listMode(data) {
  let tempStr = `<ul class="list-group list-group-flush"><hr class='ms-3 me-0'/>`
  data.forEach((list) => {
    tempStr += `
    <li class="row list-group-item d-flex align-items-center ms-3 me-0 px-0">
        <div class="col-9 ps-0">
          <h5 class="card-title">${list.title}</h5>
        </div>
        <div class="col-3">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id='${list.id}'>More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id='${list.id}'>X</button>
        </div>
      </li>`
  })
  tempStr += `</ul>`
  dataPanel.innerHTML = tempStr
}
// card: 卡片模式
function cardMode(data) {
  let tempStr = ``
  data.forEach((list) => {
    tempStr += `
    <div div class="col-sm-3" >
      <div class="my-2">
        <div class="card">
          <img src="${POSTER_URL + list.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${list.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id='${list.id}'>More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id='${list.id}'>X</button>
            </div>
        </div>
      </div>
    </div>`
  })
  tempStr += ``
  dataPanel.innerHTML = tempStr
}
// 顯示彈跳視窗
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + `${id}`).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  }).catch((error) => {
    console.log(error)
  })
}

// 移除最愛
function removeFromList(id) {
  // 一旦收藏清單是空的，就結束這個函式。
  if (!movies || !movies.length) return
  const movieIndex = movies.findIndex((movie) => movie.id === Number(id))
  // 傳入的 id 在收藏清單中不存在，就結束這個函式。
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromList(event.target.dataset.id)
  }
})
renderMovieList(movies)