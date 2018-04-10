// eslint-disable-next-line import/prefer-default-export
export class FaqQuestion {
  constructor(faqQuestion) {
    Object.assign(this, faqQuestion);
  }

  getLink() {
    return {
      pathname: `/help/${this.sectionSlug}/${this.slug}/`,
      state: { title: this.question },
    };
  }
}
