import React from 'react';

import { QUESTIONS } from './constants';
import styles from './styles.scss';


const PaymentsFAQ = () => (
  <div>
    <h2>Что такое подписка?</h2>
    <div className={styles.subscriptionFaq}>
      <div className={styles.faqColumns}>
        {QUESTIONS.map((block) => (
          <div key={block.question}>
            <h3>{block.question}</h3>
            <p>{block.answer}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PaymentsFAQ;
