const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/movies/'
const POSTER_URL = BASE_URL + 'posters/'
const MOVIE_PER_PAGE = 12
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const movies = []
let filteredMovies = []
let page = 1

// 思維:
// 當我點擊 list 模式時，會重新渲染頁面呈清單模式
// 當我點擊 card 模式時，會重新渲染頁面呈卡片模式

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
  let length = filteredMovies.length
  let num = length ? Math.ceil(length / MOVIE_PER_PAGE) : page
  renderMovieList(getMoviesPage(num))
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
          <button class="btn btn-info btn-add-favorite" data-id='${list.id}'>+</button>
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
              <button class="btn btn-info btn-add-favorite" data-id='${list.id}'>+</button>
            </div>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = tempStr
}
// 點擊 more / +
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(event.target.dataset.id)
  }
})
// +:加入最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === Number(id))
  if (list.some((movie) => movie.id === Number(id))) {
    return alert('此電影已在收藏清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
// more:顯示彈跳視窗
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

// 搜尋功能
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
//監聽表單提交事件
// 瀏覽器有對某網頁元素設定預設行為，例如： * 連擊 a 元素時會連向新的網頁； * 點擊 form 裡的 input[type = "submit"] 或 button[type = "submit"] 時，也會自動跳頁，並且將表單內容提交給遠端伺服器(如果有設定 method 和 action 屬性的話，沒有設定 action 則會重新導向當前頁面)
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //會請瀏覽器終止元件的預設行為
  filteredMovies = []
  const keyword = searchInput.value.trim().toLowerCase()
  if (keyword !== "") {
    filteredMovies = movies.filter((movie) => {
      return movie.title.toLowerCase().includes(keyword)
    })
    if (filteredMovies.length === 0) {
      return alert(`cannot find keyword : ${keyword}`)
    }
  }
  const data = filteredMovies.length ? filteredMovies : movies
  let length = filteredMovies.length
  let num = length ? Math.ceil(length / MOVIE_PER_PAGE) : page
  renderPaginator(data.length)
  renderMovieList(getMoviesPage(num))
})

// 每頁內容
function getMoviesPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}
// 頁碼
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  let tempStr = ''
  for (let page = 1; page <= numberOfPages; page++) {
    tempStr += `<li class="page-item"><a class="page-link"   data-page='${page}'>${page}</a></li>`
  }
  paginator.innerHTML = tempStr
}
// 點擊 頁碼 產生各頁內容
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  page = Number(event.target.dataset.page)
  renderMovieList(getMoviesPage(page))
})

axios.get(INDEX_URL)
  .then((response) => {
    // 使用 擴展運算子 ... : 展開陣列中的值，不用一一寫出
    movies.push(...response.data.results)
    renderMovieList(getMoviesPage(1))
    renderPaginator(movies.length)
  }).catch((error) => {
    console.log(error)
  })