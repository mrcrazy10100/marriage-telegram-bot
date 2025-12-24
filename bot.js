const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');

const bot = new Telegraf(process.env.8215805099:AAECz3cyAE1ALlFna4Oo-JC6zGFJEtFezg0);

let userData = {};

bot.start((ctx) => {
  ctx.reply("Welcome! Select your wedding year:", generateYearKeyboard());
});

function generateYearKeyboard() {
  let years = [];
  for(let y = 2010; y <= 2030; y++) years.push(Markup.button.callback(y.toString(), `year_${y}`));
  return Markup.inlineKeyboard(chunkArray(years, 3));
}

function generateMonthKeyboard() {
  let months = [];
  for(let m = 1; m <= 12; m++) months.push(Markup.button.callback(m.toString(), `month_${m}`));
  return Markup.inlineKeyboard(chunkArray(months, 4));
}

function generateDayKeyboard() {
  let days = [];
  for(let d = 1; d <= 31; d++) days.push(Markup.button.callback(d.toString(), `day_${d}`));
  return Markup.inlineKeyboard(chunkArray(days, 7));
}

function chunkArray(arr, size) {
  const result = [];
  for(let i=0; i<arr.length; i+=size) result.push(arr.slice(i,i+size));
  return result;
}

bot.action(/year_(\d+)/, (ctx) => {
  const year = ctx.match[1];
  userData[ctx.from.id] = { year };
  ctx.editMessageText(`Year selected: ${year}\nNow select month:`, generateMonthKeyboard());
});

bot.action(/month_(\d+)/, (ctx) => {
  const month = ctx.match[1];
  if(!userData[ctx.from.id]) userData[ctx.from.id] = {};
  userData[ctx.from.id].month = month;
  ctx.editMessageText(`Month selected: ${month}\nNow select day:`, generateDayKeyboard());
});

bot.action(/day_(\d+)/, async (ctx) => {
  const day = ctx.match[1];
  const user = userData[ctx.from.id];
  if(!user) return ctx.reply("Error: Please select year and month first");

  const year = user.year;
  const month = user.month;

  ctx.editMessageText(`Calculating for: ${day}-${month}-${year}...`);

  const apiUrl = `https://marriage-api-vercel.vercel.app/api/marriage?day=${day}&month=${month}&year=${year}`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if(data.status){
      ctx.reply(
        `🎉 Wedding Date: ${data.wedding_date}\n`+
        `📅 Today: ${data.today}\n`+
        `🗓 Total Days: ${data.total_days}\n`+
        `💖 ${data.years} Years | ${data.months} Months | ${data.days} Days\n`+
        `Developer: ${data.developer}`
      );
    } else {
      ctx.reply("Error: "+data.message);
    }
  } catch(e){
    ctx.reply("API call failed. Make sure your API is live.");
  }

  delete userData[ctx.from.id];
});

bot.launch();
console.log("Bot is running...");
