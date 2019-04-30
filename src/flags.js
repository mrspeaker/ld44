const flags = {
  first_chop: { done: false, msg: "" },
  first_chop_done: {
    done: false,
    msg: "Phew, it's hard work - but it's a living!"
  },
  second_chop: { done: false, msg: "It takes money to make money." },
  init_spread: {
    done: false,
    msg: "Hey! Your wealth is beginning to spread!",
    nextMsg: "second_spread",
    after: 6000
  },
  second_spread: {
    done: false,
    msg: "You've earned some upgrades!",
    nextMsg: "third_spread",
    after: 5000
  },
  third_spread: { done: false, msg: "" },
  blank: { done: false, msg: "" },
  building1: { done: false, msg: "", nextMsg: "building", after: 1 },
  building: {
    done: false,
    msg: "Big money in real estate... good for you.",
    nextMsg: "blank",
    after: 5000
  }
};

export default flags;
