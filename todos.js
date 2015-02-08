var Tasks = new Meteor.Collection("tasks");


Meteor.methods({
  createTask: function(text) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdDate: new Date(),
      checked: false,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      private: false
    })

  },

  deleteTask: function(taskId){
    var task = Tasks.findOne(taskId);
    if(task.private && task.owner !== Meteor.userId()){
      throw new Meteor.error("not-authorized");
    }
    Tasks.remove(taskId);
  },

  toggleChecked: function(taskId, checked){
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId,{$set: {checked: checked}})
  },
  togglePrivate: function(taskId, private){
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, {$set: {private: private}})
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

  Template.task.helpers({
    isOwner: function(){
      return this.owner === Meteor.userId();
    }
  });

  Template.task.events({
    "click .delete": function(){
      Meteor.call("deleteTask",this._id);
    },
    "click .toggle-checked": function(){
      Meteor.call("toggleChecked",this._id, ! this.checked);
    },
    "click .toggle-private": function(){
      Meteor.call("togglePrivate", this._id, !this.private)
    }
  });


  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.publish("tasks", function() {
    return Tasks.find({
      $or: [
        {private: {$ne: true}},
        {owner: this.userId}
      ]
    });
  });
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
