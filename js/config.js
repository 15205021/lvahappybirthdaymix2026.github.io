// =============================================================
//  КОНФИГУРАЦИЯ · все изменяемые данные собраны здесь.
//  Изменяйте только этот файл, чтобы наполнить сайт своими данными.
// =============================================================
window.CONFIG = {
  // --- Хозяйка о празднике ---
  name: "Именинница",                 // имя (используется редко, работает как заглушка)
  age: 45,
  eyebrow: "Юбилей",
  heroSub: "Буду рада разделить этот день с вами",

  // --- Дата и место ---
  eventDate: "2026-10-17T14:30:00",   // дата начала (для обратного отсчёта), локальное время
  eventDateLabel: "17 октября 2026",
  venueName: "Дом семейства Букиных",
  addressLines: [
    "Екатеринбург,",
    "ул. Гагарина, д. 27, кв. 6."
  ],

  // --- Гео: фирменные ссылки откроются в приложениях / вебе ---
  coords: { lat: 56.846120, lng: 60.644816 }, // приблизительные координаты локации
  yandexMapsUrl: "https://yandex.ru/maps/?rtext=~56.846120,60.644816&rtt=auto",
  googleMapsUrl: "https://2gis.ru/ekaterinburg/geo/1267273050403795?m=60.520492%2C56.694965%2F16",
  // При указании точного адреса карту можно построить по поисковому запросу:
  // yandexMapsUrl: "https://yandex.ru/maps/?text=Екатеринбург,+ул.+Механизаторов"
  // googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Екатеринбург,ул.+Механизаторов")

  // --- Фотография героини ---
  // Замените на URL или относительный путь до реального фото:
  photo: "photo.jpg",
  stretchCover: true,   // true = вертикальное фото занимает весь hero; false = плашка-заглушка

  // --- Программа дня [ { time: "14:30", label: "..." } ] ---
  schedule: [
    { time: "14:30", label: "Сбор гостей, фотосессия" },
    { time: "15:00", label: "Банкет, развлекательная программа" },
    { time: "21:00", label: "Дискотека" }
  ],

  // --- Варианты «Я приду» ---
  // Обязательно должен присутствовать вариант с fun: false («Не приду»)
  partyOptions: [
    { id: "dance", label: "Танцы на столе", fun: true },
    { id: "chill", label: "Душевные посиделки", fun: true },
    { id: "experiment", label: "Алкогольный эксперимент", fun: true },
    { id: "cake", label: "Просто поем торт", fun: true },
    { id: "no", label: "Не приду", fun: false }
  ],

  // --- Боевой напиток ---
  drinkOptions: [
    { id: "cognac", label: "Коньяк — для истинных аристократов" },
    { id: "moonshine", label: "Самогон — проверка на прочность" },
    { id: "wine", label: "Вино — чтобы томно вздыхать" },
    { id: "whisky", label: "Виски — для философских бесед" },
    { id: "vodka", label: "Водка — классика жанра" },
    { id: "champagne", label: "Шампанское — я здесь просто за украшениями" },
    { id: "water", label: "Сок/вода — я за рулем (ну или трус)" }
  ],

  // --- Еда ---
  foodOptions: [
    { id: "meat", label: "Мясо" },
    { id: "fish", label: "Рыба" },
    { id: "bird", label: "Птица" },
    { id: "all", label: "Ем все (и пью тоже)" }
  ],

  // --- Отправка (mock). Подключите свой бэкенд/телеграм-бот здесь. ---
  submitHandler: async (data) => {
    // data = { name, party, partyFun, drink, food }
    // Пример: отправка в Telegram-бот через ваш backend.
    // await fetch("/api/rsvp", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) });
    // Имитируем сетевую задержку:
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true };
  },

  // --- Фоновая музыка. Укажите путь/URL аудиофайла; заиграет после открытия.
  musicUrl: "music.mp3",
  musicLabel: "🎵",

  // --- Служебное: состояние переопределяется из localStorage вручную ---
  // Чтобы перепроверить анимацию конверта, очистите в консоли:
  //   localStorage.removeItem("envelope:opened"); location.reload();
  storageKey: "envelope:opened"
};
