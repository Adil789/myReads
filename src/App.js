import React from 'react'
import { Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import SearchBook from './components/search'
import './css/App.css'
import * as BooksAPI from './BooksAPI'
class App extends React.Component {
    state = {
        AdilReads: [],
        searchedBooks: []
    }
    //update the books in the shelfs of the home page 
    updateShelf = (book, shelf) => {
        
        if (shelf === 'none') {
            this.setState(prevState => ({
                AdilReads: prevState.AdilReads.filter(b => b.id !== book.id),
            }))
        }
        if (book.shelf !== shelf) {
            BooksAPI.update(book, shelf).then(() => {
                const { AdilReads, searchedBooks } = this.state
                const AdilReadsIds = AdilReads.map(b => b.id)
                const searchedBooksIds = AdilReads.map(b => b.id)
                let AdilNewReads = [] 
                let newSearchedBooks = []

                if (AdilReadsIds.includes(book.id) || searchedBooksIds.includes(book.id)) {
                    AdilNewReads = AdilReads.map(b => b.id === book.id ? { ...b, shelf } : b)
                    newSearchedBooks = searchedBooks.map(b => b.id === book.id ? { ...b, shelf } : b)

                } else {
                    book.shelf = shelf
                    AdilNewReads = [...AdilReads, book]
                    newSearchedBooks = [...searchedBooks, book]
                }
                this.setState({ AdilReads: AdilNewReads, searchedBooks: newSearchedBooks })

            })
        }
    }
    //to search the book as we wish 
    searchQuery = (event) => {
        const query = event.target.value
        if (query !== '') { 
          BooksAPI.search(query).then(searchResults => {
            if (!searchResults || searchResults.error) {
              this.setState({ searchedBooks: [] })
              return
            }
                  
            const adjustedBooks = searchResults.map(searchResult => {
                this.state.AdilReads.forEach(book => {
                if (book.id === searchResult.id) searchResult.shelf = book.shelf
              })
              return searchResult
            })
      
           
            this.setState({ searchedBooks: adjustedBooks })
      
          })
        } else {
            this.setState({ searchedBooks: [] })

        }
      }
 componentDidMount() {
        BooksAPI.getAll().then(AdilReads => {
            this.setState({ AdilReads })
        })
    }

   // if you searched book is not found then no book is displayed 

    noneBookFound = () => this.setState({ searchedBooks : []})

    //to update the search results in the search box
    updateSearchResults=(query)=>{
            if(query===""){
                const currentState = this.state;
                currentState.searchResults=[];
                this.setState(currentState);
                console.log(query);
            }
            else{
                BooksAPI.search(query).then((data)=>{
                    const currentState = this.state;
                    data.map((book)=>{
                        const x = this.state.books.find((b)=>(b.id === book.id))
                        book.shelf = (x) ? x.shelf : "none"
                    })
                    currentState.searchResults=data;
                    this.setState(currentState)
                })                
            }
        }
        //return to the home page when we add book to the home page shelfs
    render() {
        return (
            <div className="app">
                <Route path="/search" exact render={() => (
                    <SearchBook noneBookFound={this.noneBookFound} searchQuery={this.searchQuery} updateShelf={this.updateShelf} books={this.state.searchedBooks} />
                )} />
                <Route path="/" exact render={() => (
                    <HomePage updateShelf={this.updateShelf} books={this.state.AdilReads} />
                )} />

            </div>
        )
    }
}
export default App