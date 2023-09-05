# BeatTheCover - Music Guessing Game

BeatTheCover is a fun and interactive web-based game that challenges players to guess the title, artist, and genre of a song based on progressively revealed audio clips and album cover art.

## Getting Started

Follow these steps to set up and run the CoverGuess project locally on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

Clone the CoverGuess repository to your local machine:

```bash
git clone https://github.com/your-username/CoverGuess.git
```

Install the project dependencies using npm:

```bash
npm install
```

Create a `config.json` file in the project root directory with the following format:

```json
{
    "clientId": "<YOUR_SPOTIFY_ID>",
    "clientSecret": "<YOUR_SPOTIFY_SECRET>"
}
```

You can obtain your Spotify API credentials by following the instructions in the [Spotify Developer Documentation](https://developer.spotify.com/documentation/web-api).

## Usage

After successfully installing the dependencies, you can start the CoverGuess server by running the following command:  

```bash
npm start
#OR
node server.js
```

Open your web browser and go to the following URL:

```txt
http://localhost:3000/
```

## Possible Issues

There are some known issues with the Spotify API when performing searches that may affect the accuracy of genre information and suggestions.
[Problem report here](https://community.spotify.com/t5/Spotify-for-Developers/Search-doesn-t-work-anymore-on-API/td-p/5630951)
