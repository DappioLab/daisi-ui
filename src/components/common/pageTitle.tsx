import style from "@/styles/common/pageTitle.module.sass";

interface IPageTitle {
  title: string;
}

const PageTitle = (props: IPageTitle) => {
  return <div className={style.title}>{props.title}</div>;
};

export default PageTitle;
