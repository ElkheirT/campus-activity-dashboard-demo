// import usePlotly from "./usePlotly";
//
// function MyChart(props) {
//     const { ref, updates, appendData } = usePlotly();
//
//     // Here is a function that will change the data. You must pass a partial Figure object (plotly DSL object) which will be
//     // merged with all previous calls to `updates`
//     const changeData = () => updates({ data: [ { y: [Math.random() * 10], type: 'scatter' } ] })
//
//     // Here we start extending traces using the `appendData` stream
//     setInterval(() => {
//
//         appendData({ data: { y: [[Math.random() * 10]]}, tracePos: [0, 0] });
//     }, 500);
//
//     return (
//         <div>
//             <div ref={ref}  style={{ width: '500px', height: '300px' }}/>
//             <button onClick={changeData}>React!</button>
//
//         </div>);
// }
// export default MyChart