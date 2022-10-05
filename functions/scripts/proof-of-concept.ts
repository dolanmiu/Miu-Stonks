import Twitter from "twitter-v2";
import { SentimentAnalyzer, PorterStemmer, WordTokenizer } from "natural";

const aposToLexForm = require("apos-to-lex-form");
const SpellCorrector = require("spelling-corrector");
const SW = require("stopword");

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

const run = async () => {
  const client = new Twitter({
    consumer_key: "AaC0uRyikC8HDE6k1a92Kt60n",
    consumer_secret: "*",
    access_token_key: "2387889811-o1HVCgChxPKcs9cNVtosIKmkXsKYmhCauMHA3Ma",
    access_token_secret: "*",
  });

  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { data } = await client.get("tweets/search/recent", {
    query: "btc",
    max_results: "10",
  });
  // const { data } = await client.get("tweets/search/all", {
  //   query: "test",
  //   start_time: yesterday.toUTCString(),
  //   end_time: new Date().toUTCString()
  // });

  console.log(data);

  const sentimentValues: number[] = data
    .map((d: { readonly id: string; readonly text: string }) => d.text)
    .map((tweet: string) =>
      aposToLexForm(tweet)
        .toLowerCase()
        .replace(/[^a-zA-Z\s]+/g, "")
    )
    .map((alphaOnlyTweet: string) => tokenizer.tokenize(alphaOnlyTweet))
    .map((tokenizedTweet: string[]) => {
      const spellCorrectedTokens = tokenizedTweet.map((word) =>
        spellCorrector.correct(word)
      );
      console.log(spellCorrectedTokens);
      return SW.removeStopwords(spellCorrectedTokens);
    })
    .map((filteredReview: string[]) => analyzer.getSentiment(filteredReview));

  const averageSentiment =
    sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length;

  console.log(averageSentiment);
};

run();
