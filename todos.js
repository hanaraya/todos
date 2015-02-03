var Tasks = new Meteor.Collection("tasks");


Meteor.methods({
  createTask: function(text) {
    Tasks.insert({
      text: text,
      createdDate: new Date()
    })

  },

  deleteTask: function(taskId){
    Tasks.remove(taskId);
  }

});

if (Meteor.isClient) {
  Meteor.subscribe("tasks");
  Template.body.helpers({
    tasks: function() {
      return Tasks.find({}, {
        sort: {
          createdDate: -1
        }
      });
    }
  });

  Template.body.events({
    "submit .new-task": function(event) {
      var text = event.target.text.value;
      Meteor.call("createTask", text);
      event.target.text.value = "";
      return false;
    }
  });

  Template.task.events({
    "click .delete": function(){
      Meteor.call("deleteTask",this._id);
    }
  });


}

if (Meteor.isServer) {
  Meteor.publish("tasks", function() {
    return Tasks.find();
  });
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
