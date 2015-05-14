var app=require('express')();
var http=require('http').Server(app);
var io=require('socket.io')(http);


app.get('/',function(req,res){
	res.render('index');
});


//在线用户
var onlineUsers={};
//当前在线人数
var onlineCount=0;

io.on('connection',function(socket){
	console.log('a user connected');
	
	//监听新用户加入
	socket.on('login',function(obj){
		//新加入用户的唯一标识当作socket的名称
		
		
		socket.name=obj.userid;
		
		
		//检查在线列表，如果不在就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)){
			onlineUsers[obj.userid]=obj.username;
			onlineCount++;
		}
		
		//向所有客户端广播用户加入
		io.emit('login',{onlineUsers:onlineUsers,onlineCount:onlineCount,user:obj});
		console.log(obj.username+'加入了聊天室');
		
	});
	
	//监听用户退出
	socket.on('disconnect',function(){
		//将退出的用户从在线列表删除
		if(onlineUsers.hasOwnProperty(socket.name)){
			//退出用户的信息
			var obj={userid:socket.name,username:onlineUsers[socket.name]};
			delete onlineUsers[socket.name];
			onlineCount--;
			
			//广播退出
			io.emit('logout',{onlineUsers:onlineUsers,onlineCount:onlineCount,user:obj});
			console.log(obj.username+'退出了聊天室');
		}
	});
	
	socket.on('message',function(obj){
		io.emit('message',obj);
		console.log(obj.username+'说：'+obj.content);
	});
	
	
})



http.listen(3000,function(){
	console.log('listening on *:3000');
})



