import { ReplyInterface } from "./useGumState";
import { IRootState } from "@/redux/index";
import { useSelector } from "react-redux";
import ReplyForm from "./gumCommentForm";

interface IReplyListProps {
  replies: ReplyInterface[];
  postPubkey: string;
}

const ReplyList = (props: IReplyListProps) => {
  const { commentMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  return (
    <>
      {props.replies &&
        props.replies.map((reply) => {
          return (
            <div
              key={reply.cl_pubkey.toString()}
              style={{
                borderLeft: "solid .2rem #eee",
                boxShadow: "0rem .3rem .3rem rgba(0,0,0,.1)",
                padding: "1rem 2rem",
                marginTop: "2rem",
              }}
            >
              <div
                style={{
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "1.4rem",
                    margin: "2rem 0",
                  }}
                >
                  {reply.text}
                </div>
              </div>
              {
                <>
                  <div style={{ margin: "1rem 0" }}>
                    <ReplyForm
                      from={reply.from.toString()}
                      post={reply.cl_pubkey.toString()}
                      type="Reply"
                      commentsNumber={
                        commentMap.get(reply.cl_pubkey.toString())
                          ? commentMap.get(reply.cl_pubkey.toString()).length
                          : 0
                      }
                      postKey={reply.cl_pubkey.toString()}
                    />
                  </div>
                </>
              }
            </div>
          );
        })}
    </>
  );
};

export default ReplyList;
