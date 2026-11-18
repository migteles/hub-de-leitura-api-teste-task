/// <reference types="cypress" />

describe('Testes da Funcionalidade Catálogo de Livros', () => {

let token
beforeEach(() => {
    cy.geraToken('admin@biblioteca.com', 'admin123').then(tkn => {
        token = tkn
    })
});

    // Objetivo: Verificar que a API retorna lista de livros com paginação e filtros funcionando
    // Validar que filtros por categoria e autores funcionam corretamente
    it('GET - Deve listar livros com filtros e paginação', () => {
         cy.api({
          method: 'GET',
          url: 'books',
          qs: {
               category: "Ficção Clássica",
               author: "Machado de Assis",
               limit: 20,
               offset: 0,
               orderBy: 'title',
               order: 'ASC'
          }
         }).should((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.books).to.be.an("array")
         })
    });

    // Objetivo: Validar que é possível obter detalhes de um livro específico pelo ID
    // Verificar que todos os campos do livro são retornados corretamente
    it('GET - Deve obter detalhes de um livro específico', () => {
         cy.api({
          method: 'GET',
          url: 'books/1',
         }).should((response) => {
          expect(response.status).to.equal(200)
          expect(response.body.book).to.have.property('id')
          expect(response.body.book.title).to.equal('Dom Casmurro')
         })
    });

    // Objetivo: Validar que um novo livro é adicionado com sucesso ao catálogo
    // Verificar que apenas admin pode adicionar novos livros (validação de permissão)
    it('POST - Deve cadastrar um novo livro com sucesso', () => {
         cy.api({
          method: 'POST',
          url: 'books',
          body: {
               "title": "Iracema",
               "author": "José de Alencar",
               "category": "Literatura Brasileira",
               "total_copies": 2
          },
          failOnStatusCode: false
         }).should((response) => {
          expect(response.status).to.equal(401)
          expect(response.body.message).to.equal("Token de acesso necessário")
         })
         cy.api({
          method: 'POST',
          url: 'books',
          headers: { Authorization: token },
          body: {
               "title": "Iracema",
               "author": "José de Alencar",
               "category": "Literatura Brasileira",
               "total_copies": 2
          }
         }).should((response) => {
          expect(response.status).to.equal(201)
          expect(response.body.message).to.equal("Livro criado com sucesso.")
         })
    });

    // Objetivo: Garantir que dados inválidos são rejeitados ao adicionar um livro
    // Validar mensagens de erro apropriadas para dados faltantes ou incorretos
    it('POST -  Deve rejeitar livro com dados inválidos', () => {
         cy.api({
          method: 'POST',
          url: 'books',
          headers: { Authorization: token },
          body: {
               "title": "",
               "author": "José de Alencar",
               "category": "Literatura Brasileira",
               "total_copies": 2
          },
          failOnStatusCode: false
         }).should((response) => {
          expect(response.status).to.equal(400)
          expect(response.body.message).to.equal("\"title\" is not allowed to be empty")
         })
    });

    // Objetivo: Validar que um livro pode ser atualizado com sucesso
    // Verificar que apenas admin pode atualizar livros (validação de permissão)
    it('PUT - Deve atualizar um livro previamente cadastrado', () => {
          cy.cadastroLivro(token, 'O Cortiço', 'Aluísio Azevedo', 'Literatura Brasileira', '4').then(bookId => {
               cy.api({
                    method: 'PUT',
                    url: `books/${bookId}`,
                    body: {
                         "title": "Nome livro atualizado",
                         "author": "Autor Atualizado",
                         "description": "Descrição atualizada do livro",
                         "category": "Categoria atualizada",
                         "editor": "Editora Atualizada",
                         "language": "Português",
                         "publication_year": 2000,
                         "pages": 300,
                         "format": "Físico",
                         "total_copies": 10,
                         "available_copies": 5
                    },
                    failOnStatusCode: false
               }).should((response) => {
                    expect(response.status).to.equal(401)
                    expect(response.body.message).to.equal("Token de acesso necessário")
               })
               cy.api({
                    method: 'PUT',
                    url: `books/${bookId}`,
                    headers: { Authorization: token },
                    body: {
                         "title": "Nome livro atualizado",
                         "author": "Autor Atualizado",
                         "description": "Descrição atualizada do livro",
                         "category": "Categoria atualizada",
                         "editor": "Editora Atualizada",
                         "language": "Português",
                         "publication_year": 2000,
                         "pages": 300,
                         "format": "Físico",
                         "total_copies": 10,
                         "available_copies": 5
                    }
               }).should((response) => {
                    expect(response.status).to.equal(200)
                    expect(response.body.message).to.equal("Livro atualizado com sucesso.")
               });
          });
     });

    // Objetivo: Validar que um livro pode ser removido do catálogo
    // Verificar que apenas admin pode deletar livros (validação de permissão)
    it('DELETE - Deve deletar um livro previamente cadastrado', () => {
        cy.cadastroLivro(token, 'O Cortiço', 'Aluísio Azevedo', 'Literatura Brasileira', '4').then(bookId => {
          cy.api({
               method: 'DELETE',
               url: `books/${bookId}`,
               failOnStatusCode: false
          }).should((response) => {
               expect(response.status).to.equal(401)
               expect(response.body.message).to.equal("Token de acesso necessário")
          })
          cy.api({
               method: 'DELETE',
               url: `books/${bookId}`,
               headers: { Authorization: token }
          }).should((response) => {
               expect(response.status).to.equal(200)
               expect(response.body.message).to.equal("Livro deletado com sucesso.")
               expect(response.body.deletedBook).to.have.property("id")
          })
        })
    });
});
