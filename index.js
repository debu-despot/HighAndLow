const win = "win";
const lose = "lose";

const suit = {
	spade: {
		mark: "♠",
		value: 4,
	},
	heart: {
		mark: "♥",
		value: 3,
	},
	diamond: {
		mark: "♦",
		value: 2,
	},
	club: {
		mark: "♣",
		value: 1,
	},
};

const suitParameter = {};
suitParameter[suit.spade] = 4;
suitParameter[suit.spade] = 4;
suitParameter[suit.spade] = 4;
suitParameter[suit.spade] = 4;

const numberToTrumpString = n =>
	n === 1 ? "A"
	: n === 11 ? "J"
	: n === 12 ? "Q"
	: n === 13 ? "K"
	: n.toString();

class Card {
	constructor(number, suit) {
		this.number = number;
		this.suit = suit;
	}
	display = () => `${this.suit.mark}${numberToTrumpString(this.number)}`;

	battle = (enemyCard) => {
		const powerFillter = (n) => {
			const AcePumpUpPower = 13;
			const isAce = n === 1;
			if (isAce) {
				n += AcePumpUpPower;
			}
			return n;
		};

		let ownPower = powerFillter(this.number);
		let enemyPower = powerFillter(enemyCard.number);

		const isSameNumber = ownPower === enemyPower;
		if (isSameNumber) {
			ownPower += this.suit.value;
			enemyPower += enemyCard.suit.value;
		}

		const winOrLose = ownPower > enemyPower ? win : lose;
		return winOrLose;
	};
};

const compareCard = (a,b)=>{
	const val = card => card.number + ((5 - card.suit.value) * 20);
	return val(a) - val(b);
}

const createDeck = () => [...Array(13)]
	.map((_, i) =>
		Object.values(suit)
			.map(s => new Card(i + 1, s)))
	.flat();

const shuffle = ([...array]) => {
	for (let i = array.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

const scoreMsg = (winRate) =>
	winRate === 100 ? "PERFECT"
	: winRate >= 60 ?"EXCELLENT"
	: winRate >= 40 ?"OK"
	: "NOOB";

const htmleElements = {
	deck: document.getElementById("deck"),
	hiddenCard: document.getElementById("hidden-card"),
	showedCard: document.getElementById("showed-card"),
	selectHidden: document.getElementById("select-hidden"),
	selectShowed: document.getElementById("select-showed"),
	reset: document.getElementById("reset"),
	winRate: document.getElementById("win-rate"),
	cemetery: document.getElementById("cemetery"),
};

const init = (elements) => {
	const defaultResetValue = "リセット";

	const deck = shuffle(createDeck());
	elements.reset.value = defaultResetValue;
	elements.winRate.innerText = "";
	elements.cemetery.innerText = "";

	let winCount = 0;
	let loseCount = 0;
	const cemetery = [];

	const nextTurn = (next) => {
		const hidden = deck.shift();
		const showed = deck.shift();

		elements.deck.innerText = `デッキ残り:${deck.length}枚`;

		elements.hiddenCard.innerText = " ？ ";
		elements.showedCard.innerText = ` ${showed.display()} `;

		const selectCurry = (ownCard, enemyCard) => () => {
			const winOrLose = ownCard.battle(enemyCard);
			const isWin = winOrLose === win;

			const msg = `${hidden.display()} vs ${showed.display()}\nselected : ${ownCard.display()}\n${isWin ? "win" : "lose"}`;
			alert(msg);
			if (isWin) {
				winCount++;
			} else {
				loseCount++;
			}

			const totalGames = winCount + loseCount;
			const winRate = Math.round((winCount / totalGames) * 1000) / 10;
			elements.winRate.innerText = `${winCount}勝${loseCount}敗 勝率${winRate}%`;

			cemetery.push(showed);
			cemetery.push(hidden);
			cemetery.sort(compareCard);

			//groupbyがあればもっと楽だった……
			const fillterCemetary = mark =>cemetery.filter(c=>c.suit.mark === mark);
			const onelineCards = cards => cards.map(c=>numberToTrumpString(c.number)).join(",");
			const fillterCardsString = suit => suit.mark+" : "+onelineCards(fillterCemetary(suit.mark));
			elements.cemetery.innerText = fillterCardsString(suit.spade);
			elements.cemetery.innerText += "\n" + fillterCardsString(suit.heart);
			elements.cemetery.innerText += "\n" + fillterCardsString(suit.diamond);
			elements.cemetery.innerText += "\n" + fillterCardsString(suit.club);

			const isEnd = deck.length === 0;
			if(isEnd){
				alert(scoreMsg(winRate));
				elements.reset.value = "もう一度遊ぶ";
				const showEndMsg = ()=>alert("「もう一度遊ぶ」ボタンをクリックしてください");
				elements.selectHidden.onclick = showEndMsg;
				elements.selectShowed.onclick = showEndMsg;
				return;
			}
			//自己再帰したいけど色々面倒なので愚直に
			next(next);
		};
		elements.selectHidden.onclick = selectCurry(hidden, showed);
		elements.selectShowed.onclick = selectCurry(showed, hidden);

	}
	nextTurn(nextTurn);
}

reset.onclick = () => init(htmleElements);
init(htmleElements);