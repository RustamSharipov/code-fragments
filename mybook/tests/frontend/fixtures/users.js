import { Factory } from 'rosie';

import { BookFactory } from 'frontend/fixtures/books';


export const UserFactory = (
  new Factory()
    .sequence('id')
    .attr('display_name', 'Александр Пушкин')
    .attr('avatar', 'avatars/pushking.jpg')
    .attr('subscription_pro_active_till', '2021-06-28T23:59:59.999999')
    .attr('subscription_standard_active_till', '2022-03-02T23:59:59.999999')
);

export const ResetPasswordFactory = (
  new Factory()
    .attr('identifier_type', 'email')
    .attr('next_attempt_timeout', 10)
    .attr('reset_token', '777')
);

export const UserBookFactory = (
  new Factory()
    .sequence('id')
    .attr('book', () => BookFactory.build())
);

export const UserBookshelfFactory = (
  new Factory()
    .sequence('id')
    .attr('book_count', '2')
    .attr('image', null)
    .attr('is_public', true)
    .attr('name', 'Александр Пушкин')
    .attr('resource_uri', '/api/v4/bookshelf/661/')
);
