'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-09-09T14:43:26.374Z',
    '2022-09-10T18:49:59.371Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2022-09-08T16:33:06.386Z',
    '2022-09-09T14:43:26.374Z',
    '2022-09-10T18:49:59.371Z',
    '2022-09-11T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatCur = function(value, acc) {
    return new Intl.NumberFormat(acc.locale, {
        style: 'currency', 
        currency: acc.currency
    }).format(value)
}

const formatMovementDate = function(date, locale='en') {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const displayDate = `${day}/${month}/${year}`

    const calcDaysPassed = (date1, date2) => Math.trunc(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))

    const daysPassed = calcDaysPassed(new Date(), date)
    if(daysPassed === 0) return 'Today'
    if(daysPassed === 1) return 'Yesterday'
    if(daysPassed <= 7) return `${daysPassed} days ago`
    else return new Intl.DateTimeFormat(locale).format(date)
}

let sorted = false;
const displayMovements = function (acc, sort = sorted) {
    containerMovements.innerHTML = '';

    const movs = sort
        ? [...acc.movements].sort((a, b) => a - b)
        : acc.movements.slice();

    movs.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';

        let displayDate = formatMovementDate(new Date(acc.movementsDates[i]), acc.locale)

        const formatted = formatCur(mov, acc)

        const html = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">
            ${i + 1} ${type}
            </div>
            <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${formatted}</div>
        </div>
        `;
        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

const calcPrintBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

    let formatted = formatCur(acc.balance, acc)

    labelBalance.textContent = formatted;
};

function calcDisplaySummary(acc) {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = formatCur(incomes, acc);

    const outcomes = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    const createUserNames = function (accounts) {
        accounts.forEach(function (account) {
            account.username = account.owner
                .split(' ')
                .map(word => word[0])
                .join('')
                .toLowerCase();
            // console.log(account.username);
        });
    };
    createUserNames(accounts);
    labelSumOut.textContent = formatCur(Math.abs(outcomes), acc);

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(mov => (mov * acc.interestRate) / 100)
        .filter((int, i) => int >= 1)
        .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = formatCur(interest, acc);;
}

const createUserNames = function (accounts) {
    accounts.forEach(function (account) {
        account.username = account.owner
            .split(' ')
            .map(word => word[0])
            .join('')
            .toLowerCase();
        // console.log(account.username);
    });
};
createUserNames(accounts);
const reset = function () {
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    inputTransferTo.value = '';
    inputClosePin.value = '';
    inputCloseUsername.value = '';
    inputTransferAmount.value = '';
    inputLoanAmount.value = '';
};
const update = function (currentAccount) {
    displayMovements(currentAccount);

    calcPrintBalance(currentAccount);

    calcDisplaySummary(currentAccount);
};

let currentAccount;
let prev;

// // FAKE ALWAYS LOGGED IN
// currentAccount = account1
// update(currentAccount)
// containerApp.style.opacity = 100


// const now = new Date()
// const options = {
//     year: 'numeric',
//     day: 'numeric',
//     hour: 'numeric',
//     minute: 'numeric',
//     month: 'long',
//     weekday: 'long',

// }

// const locale = navigator.language
// console.log(locale);

// labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now)

btnLogin.addEventListener('click', function (e) {
    e.preventDefault();

    let account = accounts.find(
        acc => acc.username === inputLoginUsername.value
    );

    if (account?.pin === Number(inputLoginPin.value)) {
        prev = currentAccount
        currentAccount = account;
        labelWelcome.textContent = `Welcome back, ${
            currentAccount.owner.split(' ')[0]
        }`;
        containerApp.style.opacity = '1';

        const now = new Date()
        const options = {
            year: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            month: 'long',
            // weekday: 'long',

        }

        const locale = navigator.language
        console.log(locale);

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)
        if (prev !== currentAccount) {
            timer()
        }
        reset();
        update(currentAccount);
    }
});
btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();
    if (currentAccount) {
        let to = accounts.find(cur => cur.username === inputTransferTo.value);
        let amount = inputTransferAmount.value;
        if (
            to &&
            amount &&
            +(amount) <= currentAccount.balance &&
            +(amount) > 0 &&
            to.username !== currentAccount.username
        ) {
            currentAccount.movements.push(-1 * Number(amount));

            to.movements.push(Number(amount));
            currentAccount.movementsDates.push(new Date().toISOString());

            to.movementsDates.push(new Date().toISOString());
            reset();
            update(currentAccount);
        }
    }
});

btnLoan.addEventListener('click', function (e) {
    e.preventDefault();
    let amount = Math.round((inputLoanAmount.value));
    if (
        currentAccount.movements.some(cur => cur > (10 * amount) / 100) &&
        amount > 0
    ) {
        setTimeout(function() {
            currentAccount.movements.push(amount);
            
        
        currentAccount.movementsDates.push(new Date().toISOString());
        update(currentAccount);
        reset(currentAccount)}, 2000)
    }
});

btnClose.addEventListener('click', function (e) {
    e.preventDefault();
    if (currentAccount) {
        if (
            currentAccount.username === inputCloseUsername.value &&
            currentAccount.pin === Number(inputClosePin.value)
        ) {
            accounts.splice(accounts.indexOf(currentAccount), 1);
            currentAccount = null;
            containerApp.style.opacity = '0';
            reset();
        }
    }
});

btnSort.addEventListener('click', function (e) {
    e.preventDefault();
    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});
let time;
function timer() {
    let minutes = 5
    let seconds = 0

    if (time) {
        clearInterval(time)
    }
    
    time = setInterval(function() {
        seconds -- 
        if (!(minutes == 0 && seconds == 0)) {
            if (seconds < 0) {
                minutes --
                seconds = 59
            }
            labelTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

        } else {
            currentAccount = undefined;
            containerApp.style.opacity = '0'
            minutes = 5
            seconds = 0
            labelTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            labelWelcome.textContent = 'Log in to get started'
            clearInterval(time)
        }
    }, 1000)
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// console.log(23 === 23.0);

// console.log(0.1 + 0.2);
// console.log(0.1 + 0.2 === 0.3);

// console.log(Number('23'));
// console.log(+'23');

// console.log(Number.parseInt('30px', 10));
// console.log(Number.parseInt('u30', 10));

// console.log(Number.parseInt('2.5rem'));
// console.log(Number.parseFloat('2.5rem'));

// console.log(parseFloat('2.5rem'));

// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20X'));
// console.log(Number.isNaN(23 / 0));

// console.log(Number.isFinite(20));
// console.log(Number.isFinite(0.1 + 0.2));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20X'));
// console.log(Number.isFinite(23 / 0));

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));
// console.log(Number.isInteger(23.1));
// console.log(Number.isInteger(23.1 / 0));

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));

// console.log(Math.max(5, 18, '23', 11, 2));
// console.log(Math.max(5, 18, '23px', 11, 2));

// console.log(Math.min(5, 18, '23', 11, 2));

// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + 1) + min

// // console.log(randomInt(10, 20));
// console.log(Math.trunc(23.3));


// console.log(Math.round(23.3));
// console.log(Math.round(23.9));

// console.log(Math.ceil(23.3));
// console.log(Math.ceil(23.9));

// console.log(Math.floor(23.3));
// console.log(Math.floor(23.9));

// console.log(Math.floor(-23.3));
// console.log(Math.trunc(-23.3));

// console.log((2.7).toFixed(0));
// console.log((2.3).toFixed(0));
// console.log((2.7).toFixed(3));
// console.log(+(2.345).toFixed(2));
// console.log(+(2.365).toFixed(1));

// console.log(5 % 2);
// console.log(8 % 3);

// const checkEven = (num) => num % 2 === 0
// console.log(checkEven(11111111112));

// labelBalance.addEventListener('click', function(){
//   [...document.querySelectorAll('.movements__row')].forEach(function(row, i) {
//     if (i % 1 === 0) {row.style.backgroundColor = `rgb(${randomInt(1, 30)}, ${randomInt(150, 255)}, ${randomInt(150, 255)})`;
//       const html = `
//           <h2 style='margin-left: 15px; background-color: ${`rgb(${randomInt(150, 255)}, ${randomInt(150, 255)}, ${randomInt(150, 255)})`}; margin-top: 10px;'>${row.style.backgroundColor}</h2>
//         `;
//         row.innerHTML = row.innerHTML.slice(0, row.innerHTML.indexOf('<h2 st'))
//         row.innerHTML+= html
//         // row.insertAdjacentHTML('beforeend', html);
//     }
//   } )

// })

// const diameter = 287_460_000_000;
// console.log(diameter);

// const price = 245_99

// console.log( Number('230_000'))

// console.log(2 ** 53 -1);
// console.log(Number.MAX_SAFE_INTEGER);

// console.log(6345645363246253645645363456356n);
// console.log(BigInt(6345645363246253645645363456356));

// console.log(10000n + 10000n);
// const huge = 348734563546354634635463n
// const num = 23
// console.log(huge + BigInt(num));
// console.log(20n > 15);
// console.log(20n === 20);

// console.log(huge + ' is really big');
// // console.log(Math.sqrt(25n));

// console.log(10n / 3n);

// Create a date
// const now = new Date()
// console.log(now);

// console.log(new Date('Sep 11 2022 16:22:36'));
// console.log(new Date('December 24, 2015'));
// console.log(new Date(account1.movementsDates[0]));

// const future = new Date(2037, 10, 19, 15, 23)
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// console.log(new Date(2142246180000));

// console.log(Date.now());

// future.setFullYear(2040)
// console.log(future);

// const future = new Date(2020, 4, 30)
// console.log(+future);

// const calcDaysPassed = (date1, date2) => Math.trunc(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))

// const days1 = calcDaysPassed(future,  new Date(2021 ,4, 30, 15))
// console.log(days1);

// const num = 435345.23

// const options = {
//     style: 'currency', 
//     currency: `${navigator.language}`,
// }

// console.log(new Intl.NumberFormat('en-US', options).format(num));

// setTimeout((omar, faris) => console.log(faris, omar), 3000, 'omar',  'faris');