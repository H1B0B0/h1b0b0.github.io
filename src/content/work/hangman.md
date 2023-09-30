---
title: Hangman-game
publishDate: 2019-12-01 00:00:00
img: /portfolio/assets/hangman.PNG
img_alt: screen shot of the interface
description: |
  Python Hangman game. Guess words, earn points, and enjoy classic word-guessing fun. 
tags:
  - Game
  - Dev
  - Python
---

# Hangman Game

> This Python program implements a text-based version of the classic Hangman game. In Hangman, players guess letters to uncover a hidden word, and they have limited attempts to guess the correct word.

This program was created as part of the Pre MSC entry pool at Epitech.

## Introduction

This Hangman game is written in Python and uses the OpenAI GPT-3.5 Turbo model for generating random words and assisting players during the game. It offers a simple command-line interface for playing.

## Game Rules

- You start with 0 points.
- You can choose whether or not to set the language of the word.
- The game selects a random word for you to guess.
- You can guess letters or the entire word.
- For each incorrect guess, you lose a point.
- The game continues until you guess the word correctly or accumulate 11 incorrect guesses.
- If you guess the word correctly, you win.
- If you reach 11 incorrect guesses, the game ends, and you lose.

## Installation

To run the Hangman game, follow these steps:

1. Clone the repository:

    ````git clone https://github.com/H1B0B0/hangman-game````

2. Navigate to the project directory:

    ````cd hangman-game````

3. Install the required Python packages:

    ````pip install openai click````

4. Set up your OpenAI API key as an environment variable:
    - Linux: ````export OPENAI=your-api-key````
    - Windows: ````setx OPENAI "Variable value"````

5. Run the game:
    - Linux: ````python3 hangman.py````
    - Windows: ````py -3 hangman.py````

## Usage

Once the game is running, follow the prompts to play. Here's a brief overview of how to play:

1. Start the game by typing "yes" when prompted.

2. Optionally, choose to set the language of the word by entering "yes" or "no."

3. If you chose to set the language, enter the desired language.

4. The game selects a random word, and you'll see underscores representing the letters of the word.

5. Start guessing by entering letters or the entire word.

6. For each incorrect guess, you lose a point, and part of the hangman figure is drawn.

7. Continue guessing until you guess the word correctly or accumulate 11 incorrect guesses.

8. If you guess the word correctly, you win the game.

9. If you reach 11 incorrect guesses, the game ends, and you lose.

## Configuration

You can configure the game by setting your OpenAI API key as an environment variable and customizing the GPT-3.5 Turbo model. You can also modify the game's behavior by editing the `hangman.py` file.

## The link to the [Github Repository](https://github.com/H1B0B0/hangman-game)