import React, {ReactNode, useState} from "react";
import {useRouter} from "next/router";

export type PaginationProps = {
    currentPage: number,
    totalPages: number
};


// function Pagination(props: PaginationProps){
const Pagination: React.FC<PaginationProps> = (props) => {
    const router = useRouter();
    return <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
            <li key="li-0" className="page-item">
                <button className="page-link" onClick={()=> {
                    router.push(`/page/0`).then(r => console.log(r)).catch(e => console.log(e));
                }}>First
                </button>
            </li>
            <li key={`li-${props.currentPage - 1}`} className={`page-item ${props.currentPage == 0 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => {
                    router.push(`/page/${props.currentPage - 1}`).then(r => console.log(r)).catch(e => console.log(e));
                }}>Previous</button>
            </li>
            {Array.from(Array(props.totalPages).keys()).slice(Math.max(0, props.currentPage - 5), props.currentPage + 5).map((value, index, array) => (
                props.currentPage == value ?
                    <li key={`li${value}`} className="page-item disabled active">
                        <button className="page-link" onClick={() => {
                            router.push(`/page/${value}`).then(r => console.log(r)).catch(e => console.log(e));
                        }}>{value}</button>
                    </li> :
                    <li key={`li${value}`} className="page-item">
                        <button className="page-link" onClick={() => {
                            router.push(`/page/${value}`).then(r => console.log(r)).catch(e => console.log(e));
                        }}>{value}</button>
                    </li>
            ))}
            <li key={`li-${props.currentPage + 1}`} className={`page-item ${props.currentPage == props.totalPages - 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => {
                    router.push(`/page/${props.currentPage + 1}`).then(r => console.log(r)).catch(e => console.log(e));
                }}>Next</button>
            </li>
            <li>
                <button className="page-link"  onClick={() => {
                    router.push(`/page/${props.totalPages - 1}`).then(r => console.log(r)).catch(e => console.log(e));
                }}>Last</button>
            </li>
        </ul>
    </nav>;
}

export default Pagination;
