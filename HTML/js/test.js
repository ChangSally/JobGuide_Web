
/*window.onload = function() {
    addJs("js/d3.min.js");
    addJs("js/d3.js");
}

function addJs(jsName) {
    var jsFile = document.createElement("script");
    jsFile.setAttribute("type","text/javascript");
    jsFile.setAttribute("src", jsName);
    document.getElementsByTagName("head")[0].appendChild(jsFile)
}*/

function searchCompany()
{
    var name = document.getElementById("search").value;
    document.getElementById("search page").innerHTML="";
    if(name == ""){
        document.getElementById("search page").innerHTML="<center>請輸入公司名稱!!!</center>";
    }
    else{
        $.post("http://localhost:8080/test/api/searchCorporation"
               ,JSON.stringify({"name":name})
               ,function(data, status){
               var str = JSON.stringify(data);
               var company = JSON.parse(str);
               var jsobj = company.array;
               var result = company.search;
               if(result == "fail"){
               document.getElementById("search page").innerHTML="<center>查無資料!!!</center>";
               }
               else{
                    document.getElementById("search page").innerHTML="";
                    for(var i=0;i<jsobj.length;i++)
                    {
                    var t=document.getElementById("search page");
                    var sbtn=document.createElement("Button");
                    sbtn.appendChild(document.createTextNode(jsobj[i]));
                    sbtn.setAttribute("class","btn btn-default");
                    sbtn.setAttribute("id",jsobj[i]);
                    sbtn.setAttribute("value",jsobj[i]);
                    sbtn.setAttribute("style","width:100%");
                    sbtn.setAttribute("data-dismiss","modal");
                    sbtn.setAttribute("onclick","detailsOfCorporation(this)");
                    t.appendChild(document.createElement("BR"));
                    t.appendChild(sbtn);
                    }
               }
           },"json");
    }
}

function detailsOfCorporation(name){
    var corporationName = name.value;
    //console.log(corporationName);
    document.getElementById("work").innerHTML = "職缺：<br>";
    $.post("http://localhost:8080/test/api/corporationDetails"
           ,JSON.stringify({"name":corporationName})
           ,function(data, status){
           var str = JSON.stringify(data);
           var work = JSON.parse(str);
           var rank = work.rank;
           var jsobj = work.jobs;
           if(rank == 0){rank = 3;}
           else if(rank > 0 && rank <= 5){rank = 4;}
           else if(rank > 5 && rank <= 10){rank = 4.5;}
           else if(rank > 10){rank = 5;}
           else if(rank < 0 && rank >= -5){rank = 2.5;}
           else if(rank <-5 && rank >= -10){rank = 2;}
           else if(rank <-10){rank = 1;}
           window.localStorage["workdetail"] = JSON.stringify(data);
           document.getElementById("companyName").innerHTML = corporationName + "&nbsp&nbsp&nbsp評價：" + rank;
           for(var i=0;i<jsobj.length;i++){
           var str = "<a data-toggle=\"modal\" data-target=\"#tryModal\" onclick=\"workDetails('" + jsobj[i].id + "', '" + corporationName + "')\">" + (i+1) + ". " + jsobj[i].work + "</a>";
           //var str = (i+1) + ". " + jsobj[i].work;
           document.getElementById("work").innerHTML += str;
           document.getElementById("work").innerHTML += "<br>";
           }
           },"json");
}

function workDetails(id, company){
  $.post("http://localhost:8080/test/api/getDetailsOfWork"
         ,JSON.stringify({"id":id})
         ,function(data, status){
         var str = JSON.stringify(data);
         var work = JSON.parse(str);
          document.getElementById("content").innerHTML="";
          var tmp = "職位：" + work.work + "<br>公司：" + company + "<br>工作地點：" + work.location + "<br>工作內容：<br>" + work.workcontent + "<br>薪水：" + work.salary;
          tmp += "<br>聯絡資訊：<br>" + work.contact + "<br><a href=\"https://www.ptt.cc/bbs/job/" + id + ".html\">See More</a>";
          document.getElementById("content").innerHTML = tmp;
     },"json");
}

//就業潮
function getEmployment(){
    $.post("http://localhost:8080/test/api/employment"
           ,function(data, status){
           var str = JSON.stringify(data);
           var work = JSON.parse(str);
           var data = work.array;
    var svg = d3.select('.svg');
    var space = 0;
    // 設定畫布尺寸 & 邊距
    var margin = 80,
    width = 960 - margin * 0.7,
    height = 500 - margin * 2;

    svg.attr({
             "width": width + margin,
             "height": height + margin * 2,
             "transform": "translate(" + 200 + "," + space + ")"
             });

    // x 軸比例尺
    var xScale_price = d3.scale.linear()
    .domain([0, data.length])
    .range([0, width]);

    // y 軸比例尺 給繪製矩形用
    var yScale_price = d3.scale.linear()
    .domain([0, 1000])
    .range([0, height]);

    // y 軸比例尺 2 繪製座標軸用
    var yScale2_price = d3.scale.linear()
    .domain([0, 1000])
    .range([height, 0]);

    // x 軸
    var xAxis = d3.svg.axis()
    .scale(xScale_price)
    .orient("bottom")
    .ticks( data.length )
    .tickFormat(function(i){
                return (data[i]) ? data[i].month : '';   // 這裡控制坐標軸的單位
                });

    // y 軸
    var yAxis = d3.svg.axis()
    .scale(yScale2_price)
    .orient("left");

    // 繪製 x 軸
    svg.append("g")
    .attr({
          "class": "x axis",
          "transform": "translate(" + margin + "," + (height + margin) + ")",
          'fill': '#ffffff'
          })
    .call(xAxis);

    // 繪製 y 軸
    svg.append("g")
    .attr({
          "class": "y axis",
          "transform": "translate(" + margin + ", " + margin + ")",
          'fill': '#ffffff'
          })
    .call(yAxis);

    // 處理軸線位移
    svg.select('.x.axis').selectAll('.tick text').attr("dx", width * 0.05);
    svg.select('.x.axis').selectAll('.tick line').attr('transform', 'translate(' + width * 0.05 + ', 0)');

    var tmpClass;
    d3.selectAll('#button-container > button').on('click', function(){
                                                  // price, unit_price, unit
                                                  var chartType = d3.select(this).attr('id');
                                                  var xScale, yScale, yScale2, xAxis, yAxis;
                                                  var c10 = d3.scale.category10();
                                                  svg.selectAll('.'+tmpClass).remove();
                                                  // 依照圖表的類別，重新定義 x, y 比例尺
                                                  if( chartType === '2016' ){
                                                  // x 軸比例尺
                                                  xScale = d3.scale.linear().domain([0, data.length]).range([0, width]);
                                                  // y 軸比例尺 給繪製矩形用
                                                  yScale  = d3.scale.linear().domain([0, 1000]).range([0, height]);
                                                  // y 軸比例尺 2 繪製座標軸用
                                                  yScale2 = d3.scale.linear().domain([0, 1000]).range([height, 0]);
                                                  tmpClass = "first";
                                                  }
                                                  else if( chartType === '2017' ){
                                                  // x 軸比例尺
                                                  xScale = d3.scale.linear().domain([0, data.length]).range([0, width]);
                                                  // y 軸比例尺 給繪製矩形用
                                                  yScale  = d3.scale.linear().domain([0, 1000]).range([0, height]);
                                                  // y 軸比例尺 2 繪製座標軸用
                                                  yScale2 = d3.scale.linear().domain([0, 1000]).range([height, 0]);
                                                  tmpClass = "second";
                                                  }


                                                  // 座標軸重繪
                                                  // x 軸
                                                  xAxis = d3.svg.axis()
                                                  .scale(xScale)
                                                  .orient("bottom")
                                                  .ticks( data.length )
                                                  .tickFormat(function(i){
                                                              return (data[i]) ? data[i].month : '';   // 這裡控制坐標軸的單位
                                                              });

                                                  // y 軸
                                                  yAxis = d3.svg.axis().scale(yScale2).orient("left");

                                                  // 更新軸線
                                                  svg.selectAll('.x.axis').transition().duration(1000).call(xAxis);
                                                  svg.selectAll('.y.axis').transition().duration(1000).call(yAxis);


                                                  // 資料排序, 透過 d3.descending 或 d3.ascending 來決定排序方式
                                                  //data.sort(function(a, b){
                                                            // 降冪
                                                            // return d3.descending(a[chartType], b[chartType]);

                                                            // 升冪
                                                            //return a.month < b.month ? 1: -1;
                                                            //return d3.ascending(a["month"], b["month"]);
                                                            //});

                                                  // 產生長條圖
                                                  svg.selectAll('.bar')
                                                  .data(data)
                                                  .enter()
                                                  .append('rect')
                                                  .classed('bar', true);

                                                  svg.selectAll('.bar')
                                                  .transition()
                                                  .duration(700)
                                                  .attr({
                                                        'x': function(d, i) {
                                                        return xScale(i) + margin
                                                        },
                                                        'y': function(d, i) {
                                                        return height - yScale(d[chartType])+ margin;
                                                        },
                                                        'width': '5%',
                                                        'height': function(d, i) {
                                                        return yScale(d[chartType]);
                                                        },
                                                        'fill': function(d, i){
                                                        return "rgb(85, 187, 207)";
                                                        },
                                                        "transform": "translate(" +  width * (0.02) + ", " + 0 + ")",
                                                        });

                                                  svg.selectAll('.number').data(data).enter()
                                                  .append('text')
                                                  .text(function(d){
                                                        if(d[chartType] == 0){
                                                            return "";
                                                        }
                                                        return d[chartType];})
                                                  .attr({
                                                        'x': function(d, i) {
                                                        return xScale(i) + margin + 43;
                                                        },
                                                        'y': function(d, i) {
                                                        return height - yScale(d[chartType])+ 70;
                                                        },
                                                        'class':tmpClass,
                                                        'fill':'black',
                                                        'text-anchor':'middle',
                                                        'font-size':'15px'
                                                  })

                                                  });
           },"json");

}

//平均薪資
function getAverageSalary(){
    $.post("http://localhost:8080/test/api/getAverage"
           ,function(data, status){
           var str = JSON.stringify(data);
           var work = JSON.parse(str);
           var data = work.array;

           var svg = d3.select('.svg');
           var space = 0;
           // 設定畫布尺寸 & 邊距
           var margin = 80,
           margin2 = 100,
           width = 1500 - margin2 * 2,
           height = 500 - margin2 * 2;

           svg.attr({
                    "width": width + 130,
                    "height": height + margin * 2,
                    "transform": "translate(" + 0 + "," + space + ")"
                    });

           // x 軸比例尺
           var xScale_price = d3.scale.linear()
           .domain([0, data.length])
           .range([0, width]);

           // y 軸比例尺 給繪製矩形用
           var yScale_price = d3.scale.linear()
           .domain([0, 70000])
           .range([0, height]);

           // y 軸比例尺 2 繪製座標軸用
           var yScale2_price = d3.scale.linear()
           .domain([0, 70000])
           .range([height, 0]);

           // x 軸
           var xAxis = d3.svg.axis()
           .scale(xScale_price)
           .orient("bottom")
           .ticks( data.length )
           .tickFormat(function(i){
                       return (data[i]) ? data[i].category : '';   // 這裡控制坐標軸的單位
                       });

           // y 軸
           var yAxis = d3.svg.axis()
           .scale(yScale2_price)
           .orient("left");

           // 繪製 x 軸
           svg.append("g")
           .attr({
                 "class": "x axis",
                 "transform": "translate(" + margin + "," + (height + margin) + ")",
                 'fill': '#ffffff'
                 })
           .call(xAxis);

           // 繪製 y 軸
           svg.append("g")
           .attr({
                 "class": "y axis",
                 "transform": "translate(" + margin + ", " + margin + ")",
                 'fill': '#ffffff'
                 })
           .call(yAxis);

           // 處理軸線位移
           svg.select('.x.axis').selectAll('.tick text').attr("dx", width * 0.05);
           svg.select('.x.axis').selectAll('.tick line').attr('transform', 'translate(' + width * 0.05 + ', 0)');
           var tmpClass;//存前一個所選擇結果的年份，first=2016, second=2017
           d3.selectAll('#button-container > button').on('click', function(){

                                                         // price, unit_price, unit
                                                         var chartType = d3.select(this).attr('id');
                                                         var xScale, yScale, yScale2, xAxis, yAxis;
                                                         var c10 = d3.scale.category10();
                                                         svg.selectAll('.'+tmpClass).remove();
                                                         // 依照圖表的類別，重新定義 x, y 比例尺
                                                         if( chartType === '2016' ){
                                                         // x 軸比例尺
                                                         xScale = d3.scale.linear().domain([0, data.length]).range([0, width]);
                                                         // y 軸比例尺 給繪製矩形用
                                                         yScale  = d3.scale.linear().domain([0, 70000]).range([0, height]);
                                                         // y 軸比例尺 2 繪製座標軸用
                                                         yScale2 = d3.scale.linear().domain([0, 70000]).range([height, 0]);
                                                        tmpClass = "first";
                                                         }
                                                         else if( chartType === '2017' ){
                                                         // x 軸比例尺
                                                         xScale = d3.scale.linear().domain([0, data.length]).range([0, width]);
                                                         // y 軸比例尺 給繪製矩形用
                                                         yScale  = d3.scale.linear().domain([0, 70000]).range([0, height]);
                                                         // y 軸比例尺 2 繪製座標軸用
                                                         yScale2 = d3.scale.linear().domain([0, 70000]).range([height, 0]);
                                                         tmpClass = "second";
                                                         }


                                                         // 座標軸重繪
                                                         // x 軸
                                                         xAxis = d3.svg.axis()
                                                         .scale(xScale)
                                                         .orient("bottom")
                                                         .ticks( data.length )
                                                         .tickFormat(function(i){
                                                                     return (data[i]) ? data[i].category : '';   // 這裡控制坐標軸的單位
                                                                     });

                                                         // y 軸
                                                         yAxis = d3.svg.axis().scale(yScale2).orient("left");

                                                         // 更新軸線
                                                         svg.selectAll('.x.axis').transition().duration(1000).call(xAxis);
                                                         svg.selectAll('.y.axis').transition().duration(1000).call(yAxis);


                                                         // 資料排序, 透過 d3.descending 或 d3.ascending 來決定排序方式
                                                         //data.sort(function(a, b){
                                                         // 降冪
                                                         // return d3.descending(a[chartType], b[chartType]);

                                                         // 升冪
                                                         //return a.month < b.month ? 1: -1;
                                                         //return d3.ascending(a["month"], b["month"]);
                                                         //});

                                                         // 產生長條圖
                                                         svg.selectAll('.bar')
                                                         .data(data)
                                                         .enter()
                                                         .append('rect')
                                                         .classed('bar', true);

                                                         svg.selectAll('.bar')
                                                         .transition()
                                                         .duration(700)
                                                         .attr({
                                                               'x': function(d, i) {
                                                               return xScale(i) + margin + 10
                                                               },
                                                               'y': function(d, i) {
                                                               return height - yScale(d[chartType])+ margin;
                                                               },
                                                               'width': '4%',
                                                               'height': function(d, i) {
                                                               return yScale(d[chartType]);
                                                               },
                                                               'fill': function(d, i){
                                                               return "rgb(85, 187, 207)";
                                                               },
                                                               "transform": "translate(" +  width * (0.02) + ", " + 0 + ")",
                                                               });
                                                         svg.selectAll('.number').data(data).enter()
                                                         .append('text')
                                                         .text(function(d){
                                                               if(d[chartType] == 0){
                                                               return "";
                                                               }
                                                               return d[chartType];})
                                                         .attr({
                                                               'x': function(d, i) {
                                                               return xScale(i) + margin + 67;
                                                               },
                                                               'y': function(d, i) {
                                                               return height - yScale(d[chartType])+ 70;
                                                               },
                                                               'class':tmpClass,
                                                               'fill':'black',
                                                               'text-anchor':'middle',
                                                               'font-size':'15px'
                                                               })

                                                         });
           },"json");

}
