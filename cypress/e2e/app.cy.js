class RegisterForm {
  elements = {
    titleInput: () => cy.get('#title'),
    titleFeedback: () => cy.get('#titleFeedback'),
    imageUrlInput: () => cy.get('#imageUrl'),
    urlFeedback: () => cy.get('#urlFeedback'),
    btnSubmit: () => cy.get('#btnSubmit')
  }

  typeTitle(text) {
    if (!text) return
    this.elements.titleInput().type(text)
  }

  typeUrl(text) {
    if (!text) return
    this.elements.imageUrlInput().type(text)
  }

  clickSubmit() {
    this.elements.btnSubmit().click()
  }

}

const registerForm = new RegisterForm()
const colors = {
  errors: 'rgb(220, 53, 69)',
  success: 'rgb(25, 135, 84)'
}
describe('Image Registration', () => {

  before(() => {
    cy.visit('/')
  })

  after(() => {
    cy.clearLocalStorage()
  })

  describe('Submitting an image with invalid inputs', () => {

    const input = {
      title: "",
      url: ""
    }

    it(`When I enter "${input.title}" in the title field`, () => {
      registerForm.typeTitle(input.title)
    })

    it(`When I enter "${input.url}" in the title field`, () => {
      registerForm.typeUrl(input.url)
    })

    it('Then I click the submit button', () => {
      registerForm.clickSubmit()
    })

    it('Then I should see "Please type a title for the image" message above the title field', () => {
      registerForm.elements.titleFeedback().should('contain.text', 'Please type a title for the image')
    })

    it('And I should see "Please type a valid URL" message above the imageUrl field', () => {
      registerForm.elements.urlFeedback().should('contain.text', 'Please type a valid URL')
    })

    it('And I should see an exclamation icon in the title and URL fields', () => {
      registerForm.elements.titleInput().should(([element]) => {
        const style = window.getComputedStyle(element)
        const colorBorder = style.getPropertyValue('border-color')
        assert.strictEqual(colorBorder, colors.errors)
      })
    })

  })

  describe('Submitting an image with valid inputs using enter key', () => {

    const input = {
      title: 'Alien BR',
      url: 'https://cdn.mos.cms.futurecdn.net/eM9EvWyDxXcnQTTyH8c8p5-1200-80.jpg'
    }

    it(`When I enter "${input.title}" in the title field`, () => {
      registerForm.typeTitle(input.title)
      registerForm.elements.titleInput().clear()
    })

    it('Then I should see a check icon in the title field', () => {
      registerForm.clickSubmit()
      registerForm.elements.titleInput().should(([element]) => {
        const style = window.getComputedStyle(element)
        const colorBorder = style.getPropertyValue('border-color')
        assert(colors.success, colorBorder)
      })
    })

    it(`When I enter "${input.url}" in the URL field`, () => {
      registerForm.typeUrl(input.url)
      registerForm.elements.imageUrlInput().clear()
    })

    it('Then I should see a check icon in the imageUrl field', () => {
      registerForm.typeUrl(input.url)
      registerForm.elements.imageUrlInput().should('have.value', input.url)
      registerForm.clickSubmit()
      registerForm.elements.imageUrlInput().should(([element]) => {
        const style = window.getComputedStyle(element)
        const colorBorder = style.getPropertyValue('border-color')
        assert(colors.success, colorBorder)
      })
      registerForm.elements.imageUrlInput().clear()
    })

    it('Then I can hit enter to submit the form', () => {
      registerForm.typeTitle(input.title)
      registerForm.typeUrl(input.url)
      registerForm.clickSubmit()
    })

    it('And the list of registered images should be updated with the new item', () => {
      cy.get('#card-list').should(([element]) => {
        const childElementCount = element.childElementCount
        expect(4).to.equal(childElementCount)
      })
    })

    it('And the new item should be stored in the localStorage', () => {
      cy.window().should(win => {
        const item = win.localStorage.getItem('tdd-ew-db')
        expect(item).not.to.be.null
      })
    })

    it('Then The inputs should be cleared', () => {
      registerForm.elements.titleInput().clear()
      registerForm.elements.imageUrlInput().clear()
    })

  })

  describe('Submitting an image and updating the list', () => {

    const input = {
      title: 'BR Alien',
      url: 'https://cdn.mos.cms.futurecdn.net/eM9EvWyDxXcnQTTyH8c8p5-1200-80.jpg'
    }

    it(`Then I have entered "${input.title}" in the title field`, () => {
      registerForm.typeTitle(input.title)
      registerForm.elements.titleInput().clear()
    })

    it(`Then I have entered "${input.url}" in the URL field`, () => {
      registerForm.typeUrl(input.url)
      registerForm.elements.imageUrlInput().clear()
    })

    it('When I click the submit button', () => {
      registerForm.typeTitle(input.title)
      registerForm.typeUrl(input.url)
      registerForm.clickSubmit()
    })

    it('And the list of registered images should be updated with the new item', () => {
      cy.get('#card-list').should(([element]) => {
        const childElementCount = element.childElementCount
        expect(4).to.equal(childElementCount)
      })
    })

    it('And the new item should be stored in the localStorage', () => {
      cy.window().should(win => {
        const localStorage = JSON.parse(win.localStorage.getItem('tdd-ew-db'))
        const item = localStorage.filter((et) => et.title === input.title)
        expect(item[0].title).equal(input.title)
      })
    })

    it('Then The inputs should be cleared', () => {
      registerForm.elements.titleInput().clear()
      registerForm.elements.imageUrlInput().clear()
    })

  })

  describe('Refreshing the page after submitting an image clicking in the submit button', () => {

    const input = {
      title: 'ET O Extraterrestre',
      url: 'https://s2-galileu.glbimg.com/9uHHuZrRDHRZsgP3UKqx40thz-E=/0x0:800x450/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_fde5cd494fb04473a83fa5fd57ad4542/internal_photos/bs/2022/U/j/XrUuhZTZKvZEE7KWnglw/e.t.o-extraterrestre-foto-divulgacao-widelg.jpg'
    }

    it('Then I have submitted an image by clicking the submit button', () => {
      registerForm.typeTitle(input.title)
      registerForm.typeUrl(input.url)
      registerForm.clickSubmit()
      cy.wait(2000)
    })

    it('When I refresh the page', () => {
      cy.reload()
    })

    it('Then I should still see the submitted image in the list of registered images', () => {
      cy.getAllLocalStorage().should((ls) => {
        const currentLs = ls[window.location.origin]
        const elements = JSON.parse(Object.values(currentLs))
        const lastElement = elements[elements.length - 1]
        
        assert.deepStrictEqual(lastElement, {
          title: input.title,
          imageUrl: input.url,
        })
      })
    })

  })

})