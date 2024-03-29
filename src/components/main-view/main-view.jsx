import React from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { setMovies } from "../../actions/actions";
import { setUser } from "../../actions/actions";
import { LoginView } from "../login-view/login-view";
import { RegistrationView } from "../registration-view/registration-view";
import { MovieView } from "../movie-view/movie-view";
import { DirectorView } from "../director-view/director-view";
import { GenreView } from "../genre-view/genre-view";
import { ProfileView } from "../profile-view/profile-view";
import MoviesList from "../movies-list/movies-list";
import { Row, Col } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import FaUserCircle from "../user-icon/user-icon";

import "./main-view.scss";

class MainView extends React.Component {
  getUsers(token) {
    axios
      .post("https://my-blockbusters.herokuapp.com/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Assign response to state value
        this.setState({
          users: response.data,
        });
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  // Get all movies
  getMovies(token) {
    axios
      .get("https://my-blockbusters.herokuapp.com/movies", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        this.props.setMovies(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  // Get user when component mounts
  componentDidMount() {
    let accessToken = localStorage.getItem("token");
    if (accessToken !== null) {
      this.props.setUser(localStorage.getItem("user"));
      this.getMovies(accessToken);
    }
  }
  // Populate local storage user object
  onLoggedIn(authData) {
    console.log(authData);
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", authData.user.Username);
    this.props.setUser(authData.user.Username);
    this.getMovies(authData.token);
  }
  // Empty local storage user object
  onLoggedOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
    this.setState({
      user: null,
      token: null,
    });
  }
  // Register user function
  onRegister(register) {
    this.setState({
      register: register,
    });
  }

  render() {
    let { movies, user } = this.props;
    return (
      <Router>
        {/* Show Navbar when user is logged in, otherwise don't */}
        {user && (
          <Navbar id="main-nav" className="mr-auto" fixed="top" variant="dark" expand="lg">
            <Navbar.Brand style={{fontSize:"30px", fontWeight:"bold"}}>MyFlix!</Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
              <Nav
                className="me-auto"
                navbarScroll
              >
                <Link className="link-color nav-link" to={"/"}>
                  Home
                </Link>
                <Link className="link-color nav-link" to={"/profile"}>
                Profile<FaUserCircle size={20}/>
                </Link>
                <Nav.Link
                className="link-color"
                variant="dark"
                size="md"
                onClick={() => {
                  this.onLoggedOut();
                }}>
                  Logout
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        )}

        <Row className="main-view justify-content-md-center">
         
          <Route
            exact
            path="/"
            render={() => {
              if (!user)
                return (
                  <Col>
                    <LoginView onLoggedIn={(user) => this.onLoggedIn(user)} />
                  </Col>
                );
              if (movies.length === 0) 
              return (
              <div className="main-view" />)
              return <MoviesList movies={movies} />;
            }}
            />

          <Route
            path="/register"
            render={() => {
              if (user) return <Redirect to="/" />;
              return (
                <Col>
                  <RegistrationView />
                </Col>
              );
            }}
          />

          <Route
            path="/profile"
            render={() => {
              if (user)
                return (
                  <Col>
                    <ProfileView movies={movies} />
                  </Col>
                );
            }}
          />

          <Route
            path="/movies/:movieId"
            render={({ match, history }) => {
              if (!user)
                return (
                  <Col>
                    <LoginView onLoggedIn={(user) => this.onLoggedIn(user)} />
                  </Col>
                );
              if (movies.length === 0) return <div className="main-view" />;
              return (
                <Col md={12}>
                  <MovieView
                    movie={movies.find((m) => m._id === match.params.movieId)}
                    onBackClick={() => history.goBack()}
                  />
                </Col>
              );
            }}
          />

          <Route
            path="/directors/:name"
            render={({ match, history }) => {
              if (!user)
                return (
                  <Col>
                    <LoginView onLoggedIn={(user) => this.onLoggedIn(user)} />
                  </Col>
                );
              if (movies.length === 0) return <div className="main-view" />;
              return (
                <Col md={12} sm={6}>
                  <DirectorView
                    director={
                      movies.find((m) => m.Director.Name === match.params.name)
                        .Director
                    }
                    onBackClick={() => history.goBack()}
                  />
                </Col>
              );
            }}
          />

          <Route
            path="/genres/:name"
            render={({ match, history }) => {
              if (!user)
                return (
                  <Col>
                    <LoginView onLoggedIn={(user) => this.onLoggedIn(user)} />
                  </Col>
                );
              if (movies.length === 0) return <div className="main-view" />;
              return (
                <Col md={12} sm={6}>
                  <GenreView
                    genre={
                      movies.find((m) => m.Genre.Name === match.params.name)
                        .Genre
                    }
                    onBackClick={() => history.goBack()}
                  />
                </Col>
              );
            }}
          />

          <Route
            path="/users/:username"
            render={({ history }) => {
              if (!user)
                return (
                  <LoginView onLoggedIn={(data) => this.onLoggedIn(data)} />
                );
              if (movies.length === 0) return <div className="main-view" />;
              return <ProfileView history={history} movies={movies} />;
            }}
          />
        </Row>
      </Router>
    );
  }
}

let mapStateToProps = (state) => {
  return {
    movies: state.movies,
    user: state.user,
  };
};

export default connect(mapStateToProps, { setMovies, setUser })(MainView);
