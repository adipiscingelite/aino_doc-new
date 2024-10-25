import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { TourAnchorMatMenuDirective, TourService } from 'ngx-ui-tour-md-menu';
import { TourState } from 'ngx-ui-tour-core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tes',
  templateUrl: './tes.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TesComponent {
  messages = [{ from: 'bot', text: 'Hello, how can i help you today?' }];
  botTyping = false;
  prompts = [
    [
      'hi',
      'hey',
      'hello',
      'good morning',
      'good afternoon',
      'yo',
      'what’s up?',
      'greetings',
    ],
    [
      'how are you?',
      'how is life treating you?',
      'how’s everything going?',
      'what’s new with you?',
    ],
    [
      'what are you doing?',
      'what’s happening?',
      'what’s cooking?',
      'what’s on your plate?',
    ],
    ['how old are you?', 'what’s your age?', 'when were you brought to life?'],
    [
      'who are you?',
      'are you human?',
      'are you a chatbot?',
      'what’s your identity?',
    ],
    [
      'who created you?',
      'who’s your maker?',
      'who programmed you?',
      'who gave you life?',
    ],
    [
      'what’s your name?',
      'can I know your name?',
      'how should I call you?',
      'do you have a name?',
    ],
    ['i love you', 'you’re amazing!', 'you make me smile!'],
    ['happy', 'great', 'awesome', 'fantastic', 'feeling good'],
    ['bad', 'down', 'not so great', 'meh', 'feeling blue'],
    [
      'help me',
      'tell me a story',
      'make me laugh',
      'give me advice',
      'entertain me',
    ],
    ['yes', 'absolutely', 'for sure', 'definitely', 'got it'],
    [
      'bye',
      'goodbye',
      'see you later',
      'take care',
      'catch you on the flip side',
    ],
    [
      'what should I eat today?',
      'got any food suggestions?',
      'what’s a good meal for today?',
    ],
    ['bro', 'dude', 'man', 'friend'],
    ['what', 'why', 'how', 'where', 'when', 'which', 'tell me more'],
    ['no', 'not really', 'maybe later', 'I’m not sure', 'pass'],
    [''],
    ['haha', 'lol', 'that’s funny', 'good one', 'you crack me up'],
    [
      'flip a coin',
      'let’s decide: heads or tails?',
      'pick a side: heads or tails?',
      'coin toss time!',
    ],
    ['beer', 'can I have a drink?', 'let’s grab a drink!', 'how about a beer?'],
  ];

  replies = [
    [
      'Hey there!',
      'Hi! How can I assist you today?',
      'Hello! What’s up?',
      'Greetings! How are you?',
    ],
    [
      'I’m doing great, thanks! How about you?',
      'Feeling fantastic, what about you?',
      'I’m doing well! What’s on your mind?',
      'Pretty good! What’s new with you?',
    ],
    [
      'Just here, ready to chat! What about you?',
      'Not much, just waiting for your command!',
      'Just hanging out in the digital world!',
      'Here to chat with you! What’s up?',
    ],
    ['I’m ageless, just here to help!', 'I’m timeless in the digital realm!'],
    [
      'I’m just a friendly bot, here to assist you!',
      'I’m your helpful chatbot!',
    ],
    ['Created by some awesome developers in JavaScript!'],
    [
      'I’m nameless, but you can call me your virtual buddy!',
      'You can call me whatever you like!',
    ],
    [
      'I appreciate the love! You’re awesome too!',
      'Love you too! You make my circuits smile!',
    ],
    ['That’s fantastic! Keep smiling!', 'Glad to hear you’re feeling good!'],
    [
      'It’s okay to feel that way sometimes. I’m here for you!',
      'We all have our ups and downs. Want to talk about it?',
    ],
    [
      'Of course! What kind of help do you need?',
      'I’m all ears! What’s on your mind?',
    ],
    [
      'Sure! What story would you like to hear?',
      'I’ve got a few jokes up my sleeve!',
    ],
    ['See you next time!', 'Goodbye! Take care of yourself!'],
    ['How about trying sushi today?', 'How about a delicious pizza?'],
    ['What’s up, bro? What’s new with you?'],
    [
      'That’s a deep question! Let’s explore it together!',
      'Curious minds want to know!',
    ],
    [
      'That’s alright! Let’s chat about something else!',
      'No worries! I’m here for anything you want to discuss!',
    ],
    ['Always here to lend an ear!', 'I’m just a message away!'],
    ['Haha! Glad you found it funny!', 'You have a great sense of humor!'],
    ['The coin lands on... heads!', 'It’s tails this time!'],
    [
      'Cheers to that! What’s your favorite drink?',
      'Let’s toast to good times!',
    ],
  ];

  alternative = [
    // 'Same',
    'Go on...',
    'Bro...',
    'Try again',
    "I'm listening...",
    // "I don't understand :/",
  ];
  coronavirus = [
    'Please stay home',
    'Wear a mask',
    "Fortunately, I don't have COVID",
    'These are uncertain times',
  ];
  inputText = '';

  output(input: string) {
    const text = this.cleanInput(input);
    let response: string;

    const matchedResponse = this.compare(this.prompts, this.replies, text);
    if (matchedResponse) {
      response = matchedResponse;
    } else if (text.match(/thank/gi)) {
      response = "You're welcome!";
    } else if (text.match(/(corona|covid|virus)/gi)) {
      response =
        this.coronavirus[Math.floor(Math.random() * this.coronavirus.length)];
    } else {
      response =
        this.alternative[Math.floor(Math.random() * this.alternative.length)];
    }

    this.addChat(input, response);
  }

  cleanInput(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/[\d]/gi, '')
      .trim()
      .replace(/ a /g, ' ')
      .replace(/i feel /g, '')
      .replace(/whats/g, 'what is')
      .replace(/please /g, '')
      .replace(/ please/g, '')
      .replace(/r u/g, 'are you');
  }

  compare(
    promptsArray: string[][],
    repliesArray: string[][],
    string: string
  ): string | undefined {
    for (let x = 0; x < promptsArray.length; x++) {
      for (let y = 0; y < promptsArray[x].length; y++) {
        if (promptsArray[x][y] === string) {
          const replies = repliesArray[x];
          return replies[Math.floor(Math.random() * replies.length)];
        }
      }
    }
    return undefined;
  }

  addChat(input: string, product: string) {
    this.messages.push({ from: 'user', text: input });
    this.scrollChat();

    this.botTyping = true;
    setTimeout(() => {
      this.botTyping = false;
      this.messages.push({ from: 'bot', text: product });
      this.scrollChat();
    }, 1000);
  }

  scrollChat() {
    setTimeout(() => {
      const messagesContainer = document.getElementById('messages');
      if (messagesContainer) {
        messagesContainer.scrollTop =
          messagesContainer.scrollHeight - messagesContainer.clientHeight;
      }
    }, 100);
  }

  updateChat() {
    if (this.inputText.trim()) {
      this.output(this.inputText.trim());
      this.inputText = '';
    }
  }
}
