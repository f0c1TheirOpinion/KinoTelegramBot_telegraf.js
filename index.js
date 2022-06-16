const { Telegraf, session , Scenes: {BaseScene, Stage }, Markup } = require('telegraf')

const axios = require('axios');
require('dotenv').config()
const token = process.env.APITOKENID
const bot = new Telegraf(token)
const mongoose = require('mongoose')
const text = require('./comm')
const RdIdUser = require('./models/post')
var cron = require('node-cron');

const db = process.env.MONGTOKEN
mongoose
.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then((res)=> console.log('connected to DB'))
.catch((err)=> console.log('err'))

let listFilms = {};
let getInfoKino = [];
let link = 'undf';


function getMainMenu() {
  return Markup.keyboard([
      ['🍿Рандомный фильм🍿'],
      ['🍿Рандомный сериал🍿']
  ]).resize()
}

const post_keyboard_cinema = (link) =>

Markup.inlineKeyboard([

    Markup.button.url(`Начать просмотр`, `${link}`)]


)

const post_subs = (txt, url) =>

Markup.inlineKeyboard([

    Markup.button.url(`${txt}`, `${url}`)]


)


const obr = async(filmId) =>{
 await axios
  .get(`https://bazon.cc/api/search?token=${process.env.BAZON}&kp=${filmId}`,)

  .then((response) => {

    link = JSON.stringify(response.data.results[0].link).replace(/['"]+/g, '')




  })
  .catch(function (error) {
    link = 'undf';
  })
  .finally(function () {

    console.log('Finally called');
  });
}


const getFilmLst = async (message) => {

  await axios
   .get(`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(message)}&page=1`,
          {headers: {
            'X-API-KEY': process.env.KP
          }} )

   .then((response) => {
         for(let i = 0; i <= 5; i++) {
             if(response.data.films[i] == undefined){
                 break;
             }
             let names;
             let getFilmsId = JSON.stringify(response.data.films[i].filmId);
 console.log(getFilmsId);
 let getYear = JSON.stringify(response.data.films[i].year).replace(/['"]+/g, '');

             if(response.data.films[i].nameRu != undefined){
                  names = response.data.films[i].nameRu;
             }else{
                  names = response.data.films[i].nameEn;

             }

        listFilms[i] = {getFilmsId, names, getYear}
         }




         console.log('list',listFilms);
         return listFilms




   })
   .catch(function (error) {
     // handle error
     console.log(error.message);
   })
   .finally(function () {

     console.log('Finally called');
   });


 }




const getRandomFilm = async() =>{



  let arrRandomOrder = [7,8,9,10 ];
    let randomOrder = Math.floor(Math.random() * arrRandomOrder.length);
       let arrRandomYear = [];
        for( let i = 1990; i <= 2022; i++){
            arrRandomYear.push(i)
        }
        let randomForYear = Math.floor(Math.random() * arrRandomYear.length);

        console.log(arrRandomYear);

    let randomInt = Math.floor(Math.random() * 20) + 1;






await  axios
      .get(`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-filters?order=NUM_VOTE&type=FILM&ratingFrom=4&ratingTo=${arrRandomOrder[randomOrder]}&yearFrom=1989&yearTo=${arrRandomYear[randomForYear]}&page=${randomInt}`,
             {headers: {
               'X-API-KEY': process.env.KP
             }} )

      .then((response) => {

        for(let i = 0; i <= 19; i++){
          let forGenres = JSON.stringify(response.data.films[i].genres);
          let getFilmsId = JSON.stringify(response.data.films[i].filmId);
          let replaceMode = forGenres.replace(/genre/g, ',');
          let replaceModeX2 =  replaceMode.replace (/[^a-zа-я0-9]+/g, ', ');
          let getGenres = replaceModeX2.slice(2,-2);
          if(getGenres.indexOf('мультфильм,') >= 0){
            continue;
          }


          listFilms[i] = {getFilmsId}

        }





      })
      .catch(function (error) {
        // handle error
        console.log(error.message);
      })
      .finally(function () {

      });
}







const getRandomSerials = async() =>{



  let arrRandomOrder = [6,7,8,9,10 ];
    let randomOrder = Math.floor(Math.random() * arrRandomOrder.length);
       let arrRandomYear = [];
        for( let i = 1990; i <= 2021; i++){
            arrRandomYear.push(i)
        }
        let randomForYear = Math.floor(Math.random() * arrRandomYear.length);

        console.log(arrRandomYear);

    let randomInt = Math.floor(Math.random() * 20) + 1;


    let arrRandomOrd = ['NUM_VOTE', 'RATING'];
    let randomOrd = Math.floor(Math.random() * (arrRandomOrd.length));



await  axios
      .get(`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-filters?order=NUM_VOTE&type=TV_SHOW&ratingFrom=4&ratingTo=${arrRandomOrder[randomOrder]}&yearFrom=1964&yearTo=${arrRandomYear[randomForYear]}&page=${randomInt}`,
             {headers: {
               'X-API-KEY': process.env.KP
             }} )

      .then((response) => {

        for(let i = 0; i <= 19; i++){
          let forGenres = JSON.stringify(response.data.films[i].genres);
          let getFilmsId = JSON.stringify(response.data.films[i].filmId);
          let replaceMode = forGenres.replace(/genre/g, ',');
          let replaceModeX2 =  replaceMode.replace (/[^a-zа-я0-9]+/g, ', ');
          let getGenres = replaceModeX2.slice(2,-2);
          if(getGenres.indexOf('мультфильм,') >= 0){
            continue;
          }


          listFilms[i] = {getFilmsId}

        }





      })
      .catch(function (error) {
        // handle error
        console.log(error.message);
      })
      .finally(function () {

      });
}















































const getKinoInfo = async(id) =>{


await  axios
  .get(`https://kinopoiskapiunofficial.tech/api/v2.1/films/${id}?append_to_response=RATING`,
         {headers: {
           'X-API-KEY': process.env.KP
         }} )

  .then((response) => {
      let forGenres = JSON.stringify(response.data.data.genres);
      let replaceMode = forGenres.replace(/genre/g, ',');
      let replaceModeX2 =  replaceMode.replace (/[^a-zа-я0-9]+/g, ', ');
      let forSliceFilmLength = JSON.stringify(response.data.data.filmLength).replace(/['"]+/g, '')
      let sliceH = forSliceFilmLength.slice(1, -3)
      let sliceM = forSliceFilmLength.slice(-2, 5)
      let getFilmsId = JSON.stringify(response.data.data.filmId);
      let getName = JSON.stringify(response.data.data.nameRu).replace(/['"]+/g, '')
      let getYear = JSON.stringify(response.data.data.year).replace(/['"]+/g, '')
      let getRatingKn = JSON.stringify(response.data.rating.rating).replace(/['"]+/g, '')
      let getRatingImdb = JSON.stringify(response.data.rating.ratingImdb).replace(/['"]+/g, '')
      let getMinKino =  (Number(sliceH) * 60) + Number(sliceM);


      let getCountry = JSON.stringify(response.data.data.countries[0].country).replace(/['"]+/g, '')
      let getDescription = JSON.stringify(response.data.data.description).replace(/['"]+/g, '').replace(/\\n/g, '')

      let getPosterURL = JSON.stringify(response.data.data.posterUrl).replace(/['"]+/g, '')
      let getGenres = replaceModeX2.slice(2,-2);
      let getType = JSON.stringify(response.data.data.type).replace(/['"]+/g, '')

      getInfoKino = [getName, getYear, getPosterURL, getGenres, getRatingKn, getRatingImdb, getMinKino,
                     getCountry, getDescription, getType, getFilmsId ];
    console.log(getInfoKino[10]);

      return getInfoKino




  })
  .catch(function (error) {
    // handle error
    console.log(error.message);
  })
  .finally(function () {

    console.log('Finally called');
  });


}



const adv_help =  {
  reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Начать просмотр",
              url: "vk.com",
            }
          ],
          [  {
            text: "Перейти к боту",
            url: "https://t.me/KinKinobot",
          }],
        ],
      },
     parse_mode: 'HTML'
  }

  const adv_help_inz =  {
    reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Перейти к боту",
                url: "https://t.me/KinKinobot",
              }
            ],
          ],
        },
       parse_mode: 'HTML'
    }






    var postfilms = cron.schedule('1 33 23 * * *',  async () => {

      await getRandomFilm();
      let randomOrder = Math.floor(Math.random() * Object.values(listFilms).length);

     let id = listFilms[randomOrder].getFilmsId;


      if (Object.keys(listFilms).length == 0 ) {
      console.log('pizda')
     }else{
       await obr(id);
       await getKinoInfo(id)
       console.log(link);
       if(link == 'undf'){
        bot.telegram.sendMessage('@KinKinoChannel', `<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`, adv_help_inz)

       }else{
        adv_help.reply_markup.inline_keyboard[0][0].url = link
        bot.telegram.sendMessage('@KinKinoChannel', `<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`, adv_help)

        }
      getInfoKino = []

     }



    });
    postfilms.start();



























bot.start((ctx) => {

 const idUser =  ctx.from.id
 const rdIdUser = new RdIdUser({idUser});
 rdIdUser.save()
 .then((result) => console.log(result))
 .catch((error) => console.log(error))

   ctx.replyWithHTML('<b>Добро пожаловать:)</b> \n Просто напиши название фильма и наслаждайся, всё просто.', getMainMenu());
  })
bot.help((ctx) => ctx.reply(text.commands))



bot.command('pstsh', async (ctx) => {
  let statusUser = await  ctx.telegram.getChatMember(`@KinKinoChannel`, ctx.chat.id)

  if(statusUser.status == 'creator') {

    await getRandomFilm();
    let randomOrder = Math.floor(Math.random() * Object.values(listFilms).length);

   let id = listFilms[randomOrder].getFilmsId;


    if (Object.keys(listFilms).length == 0 ) {
    console.log('pizda')
   }else{
     await obr(id);
     await getKinoInfo(id)
     console.log(link);
     if(link == 'undf'){
      bot.telegram.sendMessage('@KinKinoChannel', `<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`, adv_help_inz)

     }else{
      adv_help.reply_markup.inline_keyboard[0][0].url = link
      bot.telegram.sendMessage('@KinKinoChannel', `<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`, adv_help)

      }
    getInfoKino = []

   }
    }else{
      console.log('idiNaxyu')
    }
  })



bot.command('post', async (ctx) => {
let statusUser = await  ctx.telegram.getChatMember(`@KinKinoChannel`, ctx.chat.id)

if(statusUser.status == 'creator') {
  RdIdUser.find()
  .then((result) => {

  let smUsers = Object.keys(result).length

  for(let i = 0; i < smUsers; i++){
    ctx.telegram.sendMessage(result[i].idUser, 'hi', post_keyboard_cinema('https://t.me/unkroot'))
  }


   })
  .catch((error) => console.log(error))

  }else{
    console.log('idiNaxyu')
  }
})

bot.use( (ctx, next)  => {

    ctx.telegram.getChatMember(`@KinKinoChannel`, ctx.chat.id)
    .then(member => {
        if(member.status == 'left'){
            ctx.reply('Чтобы пользоваться ботом, вы должны подписаться на наш @KinKinoChannel', post_subs('Подписаться', 'https://t.me/KinKinoChannel'))
        }else{
            return next();
        }


   })
   .catch(err => {
    console.log(err)
   })

})






const getArrayListKino = () => {
    let arraylist = [];
    const abjArr = Object.entries(listFilms);
    listFilms = {};

abjArr.forEach(([key, value]) => {
  arraylist.push([value.getFilmsId, value.names, value.getYear])
});
return arraylist
}
const post_keyboard = () =>


Markup.inlineKeyboard(

    getArrayListKino().map((x, y) => [
    Markup.button.callback(`${x[1]} - ${x[2]}`, `filmID:${x[0]}`)],


))




const listSearch = new BaseScene('listSearch')
listSearch.enter(ctx => {

 ctx.reply(`Результаты поиска по запросу `, post_keyboard())
})
listSearch.action(/^filmID:[0-9]+$/, async ctx =>{
    const id = ctx.callbackQuery.data.split(':')[1]

   await obr(id);
 await getKinoInfo(id)
 console.log(link);
 if(link == 'undf'){
  ctx.replyWithHTML(`<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`)

 }else{

    ctx.replyWithHTML(`<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`, post_keyboard_cinema(link))
  }
getInfoKino = []

})



bot.command('testing', ctx => {

  axios
  .get(`https://kinopoiskapiunofficial.tech/api/v2.1/films/`,
         {headers: {
           'X-API-KEY': process.env.KP
         }} )

  .then((response) => {
  console.log(response);



  })
  .catch(function (error) {
    // handle error
    console.log(error.message);
  })
  .finally(function () {

    console.log('Finally called');
  });

})




bot.command('random', ctx => {
  ctx.reply( 'Рандомный Фильм/Сериал', getMainMenu()
  )
})



bot.hears('🍿Рандомный фильм🍿', async(ctx) => {
 await getRandomFilm();
 let randomOrder = Math.floor(Math.random() * Object.values(listFilms).length);

let id = listFilms[randomOrder].getFilmsId;

 let lstF = await getFilmLst(ctx.message.text)

 console.log(lstF)
 if (Object.keys(listFilms).length == 0 ) {
   ctx.replyWithHTML(`<b> К сожалению, бот ничего не нашел😧</b>\nПопробуйте написать конкретнее или используйте /help`);

}else{
  await obr(id);
  await getKinoInfo(id)
  console.log(link);
  if(link == 'undf'){
   ctx.replyWithHTML(`<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`)

  }else{

     ctx.replyWithHTML(`<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`, post_keyboard_cinema(link))
   }
 getInfoKino = []

}


})





bot.hears('🍿Рандомный сериал🍿', async(ctx) => {

  await getRandomSerials();
  let randomOrder = Math.floor(Math.random() * Object.values(listFilms).length);

 let id = listFilms[randomOrder].getFilmsId;

  let lstF = await getFilmLst(ctx.message.text)

  console.log(lstF)
  if (Object.keys(listFilms).length == 0 ) {
    ctx.replyWithHTML(`<b> К сожалению, бот ничего не нашел😧</b>\nПопробуйте написать конкретнее или используйте /help`);

 }else{
  await obr(id);
 await getKinoInfo(id)
 console.log(link);
 if(link == 'undf'){
  ctx.replyWithHTML(`<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`)

 }else{

    ctx.replyWithHTML(`<a href='${getInfoKino[2]}'>\ufe0f</a> <b>${getInfoKino[0]} (${getInfoKino[1]}) </b> \n\n <b>Страна:</b>${getInfoKino[7]}  \n\n <b>Длительность:</b>${getInfoKino[6]} мин. \n\n <b>Жанр:</b>${getInfoKino[3]} \n\n ${getInfoKino[8]} \n\n <b>Кинопиоск: </b>${getInfoKino[4]} \t <b>Imdb: </b>${getInfoKino[5]}`, post_keyboard_cinema(link))
  }
getInfoKino = []

 }



})



bot.on('sticker', (ctx, next) => {

  ctx.replyWithHTML(`<b> Стикер отличный, но я его не понимаю😧</b>\nСписок доступных комманд /help`);

})


bot.on('photo', (ctx, next) => {

  ctx.replyWithHTML(`<b> Я пока не понимаю изображений, но скоро научусь😧</b>\nСписок доступных комманд /help`);

})


bot.on('message', (ctx, next) => {
  console.log(ctx);
  listFilms = {};
  var result = ctx.message.text.startsWith("/", 0);
 if(result == true){
  ctx.replyWithHTML(`<b> Неизвестная команда😧</b>\nСписок доступных комманд /help`);
}else{
   return next();
 }
})

bot.use( session(), new Stage([listSearch]).middleware())


bot.on('text', async (ctx, next) => {

    let lstF = await getFilmLst(ctx.message.text)

    console.log(lstF)
    if (Object.keys(listFilms).length == 0 ) {
      ctx.replyWithHTML(`<b> К сожалению, бот ничего не нашел😧</b>\nПопробуйте написать конкретнее или используйте /help`);

  }else{

    ctx.scene.enter('listSearch')
  }

}

    )



bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
