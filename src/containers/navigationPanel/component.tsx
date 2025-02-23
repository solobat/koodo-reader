//左侧图书导航面板
import React from "react";
import "./navigationPanel.css";
import ContentList from "../../components/contentList";
import BookNavList from "../../components/navList";
import { Trans } from "react-i18next";
import { NavigationPanelProps, NavigationPanelState } from "./interface";
import SearchBox from "../../components/searchBox";
import Parser from "html-react-parser";
import EmptyCover from "../../components/emptyCover";

class NavigationPanel extends React.Component<
  NavigationPanelProps,
  NavigationPanelState
> {
  timer: any;
  constructor(props: NavigationPanelProps) {
    super(props);
    this.state = {
      currentTab: "contents",
      chapters: [],
      cover: "",
      isSearch: false,
      searchList: null,
      startIndex: 0,
      currentIndex: 0,
    };
  }
  handleSearchState = (isSearch: boolean) => {
    this.setState({ isSearch });
  };
  handleSearchList = (searchList: any) => {
    this.setState({ searchList });
  };
  componentDidMount() {
    this.props.currentEpub
      .coverUrl()
      .then((url: string) => {
        this.setState({ cover: url });
      })
      .catch(() => {
        console.log("Error occurs");
      });
    this.props.handleFetchBookmarks();
  }

  handleChangeTab = (currentTab: string) => {
    this.setState({ currentTab });
  };
  renderSearchList = () => {
    if (!this.state.searchList[0]) {
      return (
        <div className="navigation-panel-empty-bookmark">
          <Trans>Empty</Trans>
        </div>
      );
    }
    return this.state.searchList
      .slice(
        this.state.currentIndex * 10,
        this.state.currentIndex * 10 + 10 > this.state.searchList.length
          ? this.state.searchList.length
          : this.state.currentIndex * 10 + 10
      )
      .map((item: any, index: number) => {
        return (
          <li
            className="nav-search-list-item"
            key={item.cfi}
            onClick={() => {
              this.props.currentEpub.rendition.display(item.cfi);
            }}
          >
            {Parser(item.excerpt)}
          </li>
        );
      });
  };
  renderSearchPage = () => {
    let startIndex = this.state.startIndex;
    let currentIndex =
      startIndex > 0 ? startIndex + 2 : this.state.currentIndex;
    let pageList: any[] = [];
    let total = Math.ceil(this.state.searchList.length / 10);
    if (total <= 5) {
      for (let i = 0; i < total; i++) {
        pageList.push(
          <li
            className={
              currentIndex === i
                ? "nav-search-page-item active-page "
                : "nav-search-page-item"
            }
            onClick={() => {
              this.setState({ currentIndex: i });
            }}
          >
            {i + 1}
          </li>
        );
      }
    } else {
      for (let i = 0; i < 5; i++) {
        let isShow = currentIndex > 2 ? i === 2 : currentIndex === i;
        pageList.push(
          <li
            className={
              isShow
                ? "nav-search-page-item active-page "
                : "nav-search-page-item"
            }
            onClick={() => {
              if (i === 3 && startIndex === 0) {
                this.setState({
                  startIndex: 1,
                  currentIndex: 3,
                });
                return;
              }
              this.setState({
                startIndex: currentIndex > 2 ? i + startIndex - 2 : 0,
                currentIndex: i + startIndex,
              });
            }}
          >
            {i + startIndex + 1}
          </li>
        );
      }
    }
    return pageList;
  };
  render() {
    const searchProps = {
      mode: this.state.isSearch ? "" : "nav",
      width: "100px",
      height: "35px",
      isNavSearch: this.state.isSearch,
      handleSearchState: this.handleSearchState,
      handleSearchList: this.handleSearchList,
    };
    const bookmarkProps = {
      currentTab: this.state.currentTab,
    };
    return (
      <div className="navigation-panel">
        {this.state.isSearch ? (
          <>
            <div className="nav-close-icon">
              <span
                className="icon-close"
                onClick={() => {
                  this.handleSearchState(false);
                  this.props.handleSearch(false);
                  this.setState({ searchList: null });
                }}
              ></span>
            </div>

            <div
              className="header-search-container"
              style={this.state.isSearch ? { left: 40 } : {}}
            >
              <div
                className="navigation-search-title"
                style={{ height: "20px", margin: "0px 25px 13px" }}
              >
                <Trans>Search the book</Trans>
              </div>
              <SearchBox {...searchProps} />
            </div>
            <ul className="nav-search-list">
              {this.state.searchList ? this.renderSearchList() : null}
            </ul>
            <ul className="nav-search-page">
              {this.state.searchList ? this.renderSearchPage() : null}
            </ul>
          </>
        ) : (
          <>
            <div className="navigation-header">
              {this.state.cover ? (
                <img className="book-cover" src={this.state.cover} alt="" />
              ) : (
                <div className="book-cover">
                  <EmptyCover
                    {...{
                      format: this.props.currentBook.format,
                      title: this.props.currentBook.name,
                      scale: 0.86,
                    }}
                  />
                </div>
              )}

              <p className="book-title">{this.props.currentBook.name}</p>
              <p className="book-arthur">
                <Trans>Author</Trans>:{" "}
                <Trans>
                  {this.props.currentBook.author
                    ? this.props.currentBook.author
                    : "Unknown Authur"}
                </Trans>
              </p>
              <span className="reading-duration">
                <Trans>Reading Time</Trans>: {Math.floor(this.props.time / 60)}
                &nbsp;
                <Trans>Minute</Trans>
              </span>
              <div className="navigation-search-box">
                <SearchBox {...searchProps} />
              </div>

              <div className="navigation-navigation">
                <span
                  className="book-content-title"
                  onClick={() => {
                    this.handleChangeTab("contents");
                  }}
                  style={
                    this.state.currentTab === "contents"
                      ? { color: "rgba(112, 112, 112, 1)" }
                      : { color: "rgba(217, 217, 217, 1)" }
                  }
                >
                  <Trans>Content</Trans>
                </span>
                <span
                  className="book-bookmark-title"
                  style={
                    this.state.currentTab === "bookmarks"
                      ? { color: "rgba(112, 112, 112, 1)" }
                      : { color: "rgba(217, 217, 217, 1)" }
                  }
                  onClick={() => {
                    this.handleChangeTab("bookmarks");
                  }}
                >
                  <Trans>Bookmark</Trans>
                </span>
                <span
                  className="book-bookmark-title"
                  style={
                    this.state.currentTab === "notes"
                      ? { color: "rgba(112, 112, 112, 1)" }
                      : { color: "rgba(217, 217, 217, 1)" }
                  }
                  onClick={() => {
                    this.handleChangeTab("notes");
                  }}
                >
                  <Trans>Note</Trans>
                </span>
                <span
                  className="book-bookmark-title"
                  style={
                    this.state.currentTab === "digests"
                      ? { color: "rgba(112, 112, 112, 1)" }
                      : { color: "rgba(217, 217, 217, 1)" }
                  }
                  onClick={() => {
                    this.handleChangeTab("digests");
                  }}
                >
                  <Trans>Digest</Trans>
                </span>
              </div>
            </div>
            <div className="navigation-body-parent">
              <div className="navigation-body">
                {this.state.currentTab === "contents" ? (
                  <ContentList />
                ) : (
                  <BookNavList {...bookmarkProps} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default NavigationPanel;
