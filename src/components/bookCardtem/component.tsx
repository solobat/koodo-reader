//卡片模式下的图书显示
import React from "react";
import RecentBooks from "../../utils/recordRecent";
import "./bookCardItem.css";
import { BookProps, BookState } from "./interface";
import AddFavorite from "../../utils/addFavorite";
import ActionDialog from "../../containers/actionDialog";
import OtherUtil from "../../utils/otherUtil";
import { withRouter } from "react-router-dom";
import RecordLocation from "../../utils/recordLocation";
import isElectron from "is-electron";
import EmptyCover from "../emptyCover";
declare var window: any;

class BookCardItem extends React.Component<BookProps, BookState> {
  epub: any;
  constructor(props: BookProps) {
    super(props);
    this.state = {
      isOpenConfig: false,
      isFavorite:
        AddFavorite.getAllFavorite().indexOf(this.props.book.key) > -1,
      left: 0,
      top: 0,
    };
  }

  componentDidMount() {
    let filePath = "";
    //控制是否自动打开本书
    if (isElectron()) {
      const { ipcRenderer } = window.require("electron");
      filePath = ipcRenderer.sendSync("get-file-data");
    }

    if (
      OtherUtil.getReaderConfig("isOpenBook") === "yes" &&
      RecentBooks.getAllRecent()[0] === this.props.book.key &&
      !this.props.currentBook.key &&
      !filePath
    ) {
      this.props.book.description === "pdf"
        ? window.open(`./lib/pdf/viewer.html?file=${this.props.book.key}`)
        : window.open(
            `${window.location.href.split("#")[0]}#/epub/${this.props.book.key}`
          );
    }
    this.props.handleReadingBook(this.props.book);
  }
  componentWillReceiveProps(nextProps: BookProps) {
    if (nextProps.isDragToLove !== this.props.isDragToLove) {
      if (
        nextProps.isDragToLove &&
        this.props.dragItem === this.props.book.key
      ) {
        this.handleLoveBook();
        this.props.handleDragToLove(false);
      }
    }
    if (nextProps.isDragToDelete !== this.props.isDragToDelete) {
      if (
        nextProps.isDragToDelete &&
        this.props.dragItem === this.props.book.key
      ) {
        this.handleDeleteBook();
        this.props.handleDragToDelete(false);
      }
    }
  }
  handleMoreAction = (event: any) => {
    const e = event || window.event;
    let x = e.clientX;
    if (x > document.body.clientWidth - 300) {
      x = x - 180;
    }
    this.setState(
      {
        left: x - 210,
        top:
          document.body.clientHeight - e.clientY < 320
            ? document.body.clientHeight - 120 - e.clientY
            : e.clientY - 120,
      },
      () => {
        this.props.handleActionDialog(true);
        this.props.handleReadingBook(this.props.book);
      }
    );
  };
  handleDeleteBook = () => {
    this.props.handleReadingBook(this.props.book);
    this.props.handleDeleteDialog(true);
    this.props.handleActionDialog(false);
  };
  handleLoveBook = () => {
    AddFavorite.setFavorite(this.props.book.key);
    this.setState({ isFavorite: true });
    this.props.handleMessage("Add Successfully");
    this.props.handleMessageBox(true);
  };
  handleCancelLoveBook = () => {
    AddFavorite.clear(this.props.book.key);
    this.setState({ isFavorite: false });
    this.props.handleMessage("Cancel Successfully");
    this.props.handleMessageBox(true);
  };
  //控制按钮的弹出
  handleConfig = (mode: boolean) => {
    this.setState({ isOpenConfig: mode });
  };
  handleJump = () => {
    RecentBooks.setRecent(this.props.book.key);

    this.props.book.description === "pdf"
      ? window.open(`./lib/pdf/viewer.html?file=${this.props.book.key}`)
      : window.open(
          `${window.location.href.split("#")[0]}#/epub/${this.props.book.key}`
        );
  };
  render() {
    let percentage = RecordLocation.getCfi(this.props.book.key)
      ? RecordLocation.getCfi(this.props.book.key).percentage
      : 0;
    const actionProps = { left: this.state.left, top: this.state.top };
    return (
      <>
        <div
          className="book-list-item"
          onMouseOver={() => {
            this.handleConfig(true);
          }}
          onMouseLeave={() => {
            this.handleConfig(false);
          }}
        >
          {this.props.book.cover &&
          this.props.book.cover !== "noCover" &&
          this.props.book.publisher !== "mobi" &&
          this.props.book.publisher !== "azw3" &&
          this.props.book.publisher !== "txt" ? (
            <img
              className="book-item-cover"
              src={this.props.book.cover}
              alt=""
              onClick={() => {
                this.handleJump();
              }}
              onDragStart={() => {
                this.props.handleDragItem(this.props.book.key);
              }}
              onDragEnd={() => {
                this.props.handleDragItem("");
              }}
            />
          ) : (
            <div
              className="book-item-cover"
              onClick={() => {
                this.handleJump();
              }}
              onDragStart={() => {
                this.props.handleDragItem(this.props.book.key);
              }}
              onDragEnd={() => {
                this.props.handleDragItem("");
              }}
            >
              <EmptyCover
                {...{
                  format: this.props.book.format,
                  title: this.props.book.name,
                  scale: 1,
                }}
              />
            </div>
          )}

          <p className="book-item-title">{this.props.book.name}</p>

          {this.state.isFavorite ? (
            <span
              className="icon-love book-loved-icon"
              onClick={() => {
                this.handleCancelLoveBook();
              }}
            ></span>
          ) : null}

          {this.state.isOpenConfig ? (
            <>
              {this.props.book.format !== "PDF" && (
                <div className="reading-progress-icon">
                  <div style={{ position: "relative", left: "4px" }}>
                    {percentage
                      ? Math.floor(percentage * 100) < 10
                        ? "0" + Math.floor(percentage * 100)
                        : Math.floor(percentage * 100) === 100
                        ? "完"
                        : Math.floor(percentage * 100)
                      : "00"}
                    <span className="reading-percentage-char">%</span>
                  </div>
                </div>
              )}
              <span
                className="icon-more book-more-action"
                onClick={(event) => {
                  this.handleMoreAction(event);
                }}
              ></span>
              <span
                className="icon-love book-love-icon"
                onClick={() => {
                  this.handleLoveBook();
                }}
              ></span>
            </>
          ) : null}
        </div>
        {this.props.isOpenActionDialog &&
        this.props.book.key === this.props.currentBook.key ? (
          <ActionDialog {...actionProps} />
        ) : null}
      </>
    );
  }
}
export default withRouter(BookCardItem);
