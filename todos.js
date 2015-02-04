var Tasks = new Meteor.Collection("tasks");


Meteor.methods({
  createTask: function(text) {
    Tasks.insert({
      text: text,
      createdDate: new Date(),
      checked: false
    })

  },

  deleteTask: function(taskId){
    Tasks.remove(taskId);
  },

  toggleChecked: function(taskId, checked){
    Tasks.update(taskId,{$set: {checked: checked}})
  }

});

if (Meteor.isClient) {
  Meteor.subscribe("tasks");
  Template.body.helpers({
    tasks: function() {
      if(Session.get("hideCompleted")){
        return Tasks.find({checked: {$ne: true}},{sort: {
          createdDate: -1
        }})
      }
      else{
      return Tasks.find({}, {
        sort: {
          createdDate: -1
        }
      })}},
      incompleteCount: function(){
        return Tasks.find({checked: {$ne: true}}).count();
      }

  });

  Template.body.events({
    "submit .new-task": function(event) {
      var text = event.target.text.value;
      Meteor.call("createTask", text);
      event.target.text.value = "";
      return false;
    },
    "change .hide-completed input": function(event){
      Session.set("hideCompleted",event.target.checked)
    }
  });

  Template.task.events({
    "click .delete": function(){
      Meteor.call("deleteTask",this._id);
    },
    "click .toggle-checked": function(){
      Meteor.call("toggleChecked",this._id, ! this.checked);
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
