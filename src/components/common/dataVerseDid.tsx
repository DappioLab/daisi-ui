import {
  RuntimeConnector,
  Apps,
  ModelNames,
  FileType,
  MirrorFile,
  Extension,
} from "@dataverse/runtime-connector";
import { useEffect, useState } from "react";
const runtimeConnector = new RuntimeConnector(Extension);

const DataVerseDid = () => {
  const [dataVerseDid, setDataVerseDid] = useState("");

  const getDataverseDid = async () => {
    const did = await runtimeConnector.getCurrentDID();
    setDataVerseDid(did);
  };

  useEffect(() => {
    getDataverseDid();
  }, []);

  return (
    <>
      <span>@handle - {dataVerseDid.toString().substring(0, 6)}</span>
      <span>...</span>
      <span>{dataVerseDid.toString().slice(-6)}</span>
    </>
  );
};

export default DataVerseDid;
