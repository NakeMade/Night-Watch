



//получаем необходимые элементы
const searchLink = document.querySelector('.search__link .icon-reg'),//иконка поиска
    mainContent = document.querySelector('.main__content'),//основной див под отображение инфы о фильме
    mainClose = document.querySelectorAll('.main__close'),//кнопка закрытия дива под инфу фильма
    mainBlock = document.querySelector('.main__block'),//див для вывода результатов поиска
    movieSolo = document.querySelector('.main__solo'),//див для отображения инфы о единочном фильма
    moviesLink = document.querySelectorAll('.movies__link'),//кнопка фильмы
    formMain = document.querySelector('.form__main'),//форма поиска
    formInput = document.querySelector('input'),//поисковой запрос
    anime = document.querySelector('.anime'),//прелоадер
    pagination = document.querySelector('.pagination'),//пагинация
    headerBtn = document.querySelector('.header__btn'),//кнопка открытия бокового меню
    headerAbs = document.querySelector('.header__abs'),//темная блость
    headerItems = document.querySelector('.header__items');//боковое меню


//открытие и закрытие бокового меню

headerBtn.addEventListener('click', function(e){
    e.preventDefault();
    if(!this.classList.contains('active')){
        this.classList.add('active');
        headerItems.classList.add('active');
        headerAbs.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    else{
        this.classList.remove('active');
        headerItems.classList.remove('active');
        headerAbs.classList.remove('active');
        document.body.style.overflow = '';
    }
});
//закрытие бокового меню при нажатии на темную область

headerAbs.addEventListener('click', function(e){
    e.preventDefault();
    this.classList.remove('active');
    headerItems.classList.remove('active');
    headerBtn.classList.remove('active');
    document.body.style.overflow = '';
});
function openMainBlock(e){
    e.preventDefault();
    mainContent.classList.add('active');
    document.body.style.overflow = 'hidden';
};
searchLink.addEventListener('click', openMainBlock);
moviesLink.forEach(item => item.addEventListener('click', openMainBlock));
mainClose.forEach(item => {
    item.addEventListener('click', function(e){
        e.preventDefault();
        mainContent.classList.remove('active');
        document.body.style.overflow = '';
    });
});


const host = 'https://kinopoiskapiunofficial.tech';
const hostName = 'X-API-KEY';
const hostValue = '4a8ae204-e6bc-456b-94b9-45c6e783267f';

class Kino {
    constructor(){
        this.date = new Date().getMonth();
        this.curYear = new Date().getFullYear();
        this.months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        this.curMonth = this.months[this.date];
    }
    //подключаемся к базе с фильмами
    fOPen = async (url) => {
        let res = await fetch(url, {
            headers: {
                [hostName]: hostValue
            }
        });
        if(res.ok) return res.json();
        else throw new Error(`Cannot access to ${url}`);
    }
    getTopMovies = (page = 1) => this.fOPen(`${host}/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=${page}`); 
    getSoloFilm = (id) => this.fOPen(`${host}/api/v2.1/films/${id}`);
    getMostAwaited = (page = 1, year = this.curYear, month=this.curMonth) => this.fOPen(`${host}/api/v2.1/films/releases?year=${year}&month=${month}&page=${page}`);
    getFrames = (id) => this.fOPen(`${host}/api/v2.2/films/${id}/images?type=STILL&page=1`);
    getReviews = (id) => this.fOPen(`${host}/api/v2.2/films/${id}/reviews?page=1&order=DATE_DESC`);
    getSearch = (page=1, keyword) => this.fOPen(`${host}/api/v2.1/films/search-by-keyword?keyword=${keyword}&page=${page}`);
};

const db = new Kino();

function renderTrendMovies(element = [], fn = [], films = [], params = []){
    anime.classList.add('active');
    element.forEach((item, i) => {
        let parent = document.querySelector(`${item} .swiper-wrapper`);
        db[fn[i]](params[i]).then(data => {
            data[films[i]].forEach(elem => {
              
                let slide = document.createElement('div');
                slide.classList.add('swiper-slide');
                slide.innerHTML = `
                    <div class="movie__item" data-id="${elem.filmId}">
                        <img src="${elem.posterUrlPreview}" alt="${elem.nameRu || elem.nameEn}" loading="lazy">
                    </div>
                `;
                parent.append(slide);
            });
        })
        .then(() => {
            element.forEach(item => {
                new Swiper(`${item}`, {
                    slidesPerView: 1,
                    spaceBetween: 27,
                    // slidesPerGroup: 3,
                    loop: true,
                    // loopFillGroupWithBlank: true,
                    navigation: {
                        nextEl: `${item} .swiper-button-next`,
                        prevEl: `${item} .swiper-button-prev`,
                    },
                    breakpoints: {
                        1440: {
                            slidesPerView: 6,
                        },
                        1200: {
                            slidesPerView: 5,
                        },
                        960: {
                            slidesPerView: 4,
                        },
                        720: {
                            slidesPerView: 3,
                        },
                        500: {
                            slidesPerView: 2,
                        }
                    }
                });
            });
            let pages = 13;
            let rand = Math.floor(Math.random() * pages + 1);
            renderHeader(rand);
            let m = document.querySelectorAll('.movie__item');
            m.forEach(item => {
                item.addEventListener('click', function(e){
                    let attr = this.getAttribute('data-id');
                    openMainBlock(e);
                    renderSolo(attr);
                })
            });
        })
        .catch(e => {
            console.log(e);
            anime.classList.remove('active');
        })
    });
};
renderTrendMovies(['.trend__tv-slider', '.popular__actors-slider'], ['getTopMovies', 'getMostAwaited'], ['films', 'releases'], [1,1]);


function renderHeader(page){
    db.getTopMovies(page).then(data => {
        anime.classList.add('active');
        let max = Math.floor(Math.random() * data.films.length);
        let filmId = data.films[max].filmId;
        let filmRating = data.films[max].rating;
        db.getSoloFilm(filmId).then(response => {
            let sm = response.data;
            let headerText = document.querySelector('.header__text');
            let url = sm.webUrl.split('www.').join('gg');
            headerText.innerHTML = `
                <h1 class="header__title">${sm.nameRu || sm.nameEn}</h1>
                <div class="header__balls">
                    <span class="header__year">${sm.year}</span>
                    <span class="logo__span header__rating  header__year ">${sm.ratingAgeLimits}+</span>
                    <div class="header__seasons header__year">${sm.seasons.length}+</div>
                    <div class="header__stars header__year"><span class="icon-solid"></span><strong>${filmRating}</strong></div>
                </div>
                <p class="header__descr">
                    ${sm.description}
                </p>
                <div class="header__buttons">
                    <a href="${url}" class="header__watch"><span class="icon-solid"></span>watch</a>
                    <a href="#" class="header__more header__watch movie__item" data-id="${sm.filmId}">More information</a>
                </div>
                `;
                anime.classList.remove('active');
        })
        .then(() => {
            let headerMore = document.querySelector('.header__more');
            headerMore.addEventListener('click', function(e){
                e.preventDefault();
                openMainBlock(e);
                let attr = this.getAttribute('data-id');
                renderSolo(attr);
            })
        })
    })
}


const popularTitle = document.querySelector('.popular__actors-title strong'),
    popularPoster = document.querySelector('.coming__soon-block > img'),
    popularYear = document.querySelector('.year');

popularTitle.textContent = `${db.curMonth} ${db.curYear}`;
popularYear.textContent = db.curYear;
db.getTopMovies(2).then(res => {
    let rand = Math.floor(Math.random() * res.films.length);
    popularPoster.src = res.films[rand].posterUrlPreview;
});


async function renderSolo(id){
    mainBlock.innerHTML = '';
    pagination.innerHTML = '';
    anime.classList.add('active');
    (async function (){
        const [reviews, frames, solo] = await Promise.all([
            db.getReviews(id),
            db.getFrames(id),
            db.getSoloFilm(id)
        ])
        return { reviews, frames, solo};
    }())
    .then(res => {
        console.log(res);
        let solo = res.solo.data;
        let genres = solo.genres.reduce((acc, item) => acc + `${item.genre} `, '');
        let countries = solo.countries.reduce((acc, item) => acc + `${item.country} `, '');
        let facts = '';
        let frames = '';
        let reviews = '';
        res.reviews.items.forEach((item, i) => {
            if(i < 10) {
                reviews += `
                    <div class="review__item">
                        <span>${item.author}</span>
                        <p class="review__descr">${item.description}</p>
                    </div>
                `;
            }
        });
        res.frames.items.forEach((item, i) => {
            if(i < 10) frames += `<img src="${item.previewUrl}" alt="" loading="lazy">`;
        });
        solo.facts.forEach((item, i) => {
            if(i < 10) facts += `<li class="solo__facts">${i+1}: ${item}</li>`;
        });
        let link = solo.webUrl.split('www.').join('gg');
        let div = `
        <div class="solo__img">
            <img src="${solo.posterUrlPreview}" alt="${solo.nameRu || solo.nameEn}">
            <a href="${link}" class="solo__link header__watch">Смотреть фильм</a>
        </div>
        <div class="solo__content">
            <h3 class="solo__title trend__tv-title">${solo.nameRu || solo.nameEn}</h3>
            <ul>
                <li class="solo__countries">Страны: ${countries}</li>
                <li class="solo__genres">Жанры: ${genres}</li>
                <li class="solo__dur">Продолжительность: ${solo.filmLength}</li>
                <li class="solo__year">Год: ${solo.year}</li>
                <li class="solo__premiere">Мировая премьера: ${solo.premiereWorld}</li>
                <li class="solo__rating">Возрастной рейтинг: ${solo.ratingAgeLimits}+</li>
                <li class="solo__slogan">Слоган: ${solo.slogan}</li>
                <li class="solo__descr header__descr">Описание: ${solo.description}</li>
            </ul>
        </div>
        <ul class="solo__facts">
            <h3 class="trend__tv-title">Интересные факты</h3>
            ${facts}
        </ul>
        <h3 class="solo__title2 trend__tv-title">Кадры из фильма</h3>
        <div class="solo__images">
            ${frames}
        </div>
        <div class="solo__reviews">
            <h3 class="solo__title2 trend__tv-title">Отзывы</h3>
            ${reviews}
        </div>
        `;
        movieSolo.innerHTML = div;
        anime.classList.remove('active');
    })
    .catch(e => {
        console.log(e);
        anime.classList.remove('active');
    })
}
function renderPagination(cur=1, len){
    pagination.innerHTML = '';
    let ul = document.createElement('ul');
    let list = len < 14 ? len : 14;
    ul.classList.add('header__list');
    for (let i = 1; i <= list; i++) {
       let li = document.createElement('li');
       li.innerHTML = `<a href="#" data-page="${i}" class="pagination__link ${i == cur ? 'active' : ''}">${i}</a>`;
       ul.append(li); 
    }
    pagination.append(ul);
}
function clickPagination(val, fn){
    let links = document.querySelectorAll('.pagination__link');
    links.forEach(item => {
        item.addEventListener('click', function(e){
            e.preventDefault();
            let dataPage = this.getAttribute('data-page');
            renderCards(dataPage, val, fn);
        })
    })
}
function renderCards(page = 1, se='', fn='getTopMovies'){
    mainBlock.innerHTML = '';
    movieSolo.innerHTML = '';
    db[fn](page, se).then(data => {
        if(data.films.length > 0){
            data.films.forEach(item => {
                let someItem = document.createElement('div');
                someItem.classList.add('some__item');
                someItem.innerHTML = `
                    <div class="some__img">
                        <img src="${item.posterUrlPreview}" alt="${item.nameRu || item.nameEn}" loading="lazy">
                        <span class="some__rating">${item.rating || 0}</span>
                    </div>
                    <h3 class="some__title">${item.nameRu || item.nameEn}</h3>
                `;
                someItem.setAttribute('data-id', item.filmId);
                mainBlock.append(someItem);
            });
            renderPagination(page, data.pagesCount);
        }
        else {
            mainBlock.innerHTML = `<p class="undefined">Ничего не найдено</p>`;
        }
    })
    .then(() => {
        let film = document.querySelectorAll('.some__item');
        film.forEach(item => {
            item.addEventListener('click', function(){
                let attr = this.getAttribute('data-id');
                renderSolo(attr);
            })
        });
        clickPagination(se, fn);
        anime.classList.remove('active');
    })
    .catch(e => {
        console.log(e);
        anime.classList.remove('active');
    })
}
renderCards();
formMain.addEventListener('submit', function(e){
    e.preventDefault();
    anime.classList.add('active');
    renderCards(1, formInput.value, 'getSearch');
});