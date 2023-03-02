import Parser from "rss-parser";

type CustomFeed = { foo: string };
type CustomItem = { bar: number };

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    feed: ["foo"],
    //            ^ will error because `baz` is not a key of CustomFeed
    item: ["bar"],
  },
});

export const getRss = async () => {
  const feed = await parser.parseURL(
    "https://cors-anywhere.herokuapp.com/https://www.reddit.com/.rss"
  );
  console.log(feed.title); // feed will have a `foo` property, type as a string

  feed.items.forEach((item) => {
    console.log(item.title + ":" + item.link); // item will have a `bar` property type as a number
  });
};
