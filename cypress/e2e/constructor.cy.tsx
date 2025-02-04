import { BASE_URL, testUrl } from '../../src/utils/urlTest';
import cypress from 'cypress';


const FLUORESCENT_BULKA = 'Флюоресцентная булка R2-D3';
const MOLUSK_MEAT = 'Мясо бессмертных моллюсков Protostomia';
const MODAL_SELECTOR = '[data-cy=modal]';
const MODAL_CLOSE_SELECTOR = '[data-cy=modal-close]';
const CRATOR_BULKA = 'Краторная булка N-200i'

describe('Перехват запроса на эндпоинт ingredients', () => {
  beforeEach(() => {
    cy.intercept('GET', `${BASE_URL}/ingredients`, {
      fixture: 'ingredients'
    });
    cy.visit(`${testUrl}`);
  });
  describe('Проверка сбора бургера', () => {
    it('Проверка добавления одного игредиента', () => {
      cy.contains('li', FLUORESCENT_BULKA).find('button').click();
      cy.contains('span', FLUORESCENT_BULKA).should('exist');
    });

    it('Проверка добавления нескольких ингредиентов', () => {
      cy.contains('li', FLUORESCENT_BULKA).find('button').click();

      cy.contains('div', 'Начинки').click();
      cy.contains('li', 'Филе Люминесцентного тетраодонтимформа')
        .find('button')
        .click();
      cy.contains('li', 'Хрустящие минеральные кольца').find('button').click();
      cy.contains('li', 'Сыр с астероидной плесенью').find('button').click();
    });

    it('Проверка смена булки', () => {
      cy.contains('li', CRATOR_BULKA).find('button').click();
      cy.contains('li', FLUORESCENT_BULKA).find('button').click();

      cy.contains('span', FLUORESCENT_BULKA);
      cy.contains('span', CRATOR_BULKA).should('not.exist');
    });
  });

  describe('Проверка работы модальных окон', () => {
    it('Проверка открытия модального окна ингредиента', () => {
      cy.contains('li', MOLUSK_MEAT).click();
      cy.wait(1000);

      const modal = cy.get(MODAL_SELECTOR);
      modal.should('exist');

      const close = cy.get(MODAL_CLOSE_SELECTOR);
      close.should('exist');

      modal.contains('h3', 'Детали ингредиента');
      cy.contains('h3', MOLUSK_MEAT);
    });

    it('Проверка закрытия модального окна ингредиентов по клику', () => {
      cy.contains('li', MOLUSK_MEAT).click();

      const modal = cy.get(MODAL_SELECTOR);
      modal.should('exist');

      const close = cy.get(MODAL_CLOSE_SELECTOR);
      close.should('exist');

      modal.contains('h3', 'Детали ингредиента');

      close.click();
      modal.should('not.exist');
    });

    it('Проверка закрытия модального окна ингредиентов по клавише esc', () => {
      cy.contains('li', MOLUSK_MEAT).click();

      const modal = cy.get(MODAL_SELECTOR);
      modal.should('exist');

      cy.get('body').type('{esc}');

      cy.get(MODAL_SELECTOR).should('not.exist');
    });
  });

  describe('Проверка создания заказа', () => {
    beforeEach(() => {
      cy.intercept('GET', `${BASE_URL}/auth/user`, {
        fixture: 'user.json'
      });

      cy.intercept('POST', `${BASE_URL}/orders`, {
        fixture: 'order.json'
      }).as('createOrder');

      cy.setCookie('token', 'token');
      window.localStorage.setItem('token', 'token');
    });

    it('Проверка создания заказа', () => {
      cy.contains('li', CRATOR_BULKA).find('button').click();

      cy.contains('div', 'Начинки').click();
      cy.contains('li', 'Филе Люминесцентного тетраодонтимформа')
        .find('button')
        .click();
      cy.contains('div', 'Соусы').click();
      cy.contains('li', 'Соус фирменный Space Sauce').find('button').click();

      cy.contains('button', 'Оформить заказ').click();
      cy.wait('@createOrder');

      const modal = cy.get(MODAL_SELECTOR);
      modal.should('exist');
      const close = cy.get(MODAL_CLOSE_SELECTOR);
      close.should('exist');

      cy.contains('p', 'идентификатор заказа');
      cy.contains('p', 'Ваш заказ начали готовить');
      cy.contains('h2', '123456').should('exist');
      cy.contains('p', 'Дождитесь готовности на орбитальной станции');

      close.click();
      cy.contains('p', 'идентификатор заказа').should('not.exist');
      cy.contains('p', 'Ваш заказ начали готовить').should('not.exist');
      cy.contains('h2', '123456').should('not.exist');
      cy.contains('p', 'Дождитесь готовности на орбитальной станции').should(
        'not.exist'
      );
    });

    afterEach(() => {
      cy.clearCookie('token');
      window.localStorage.removeItem('token');
    });
  });
});