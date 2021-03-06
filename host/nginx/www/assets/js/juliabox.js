var JuliaBox = (function(){
	var _msg_body = null;
	var _msg_div = null;
	var _gauth = null;
	
	var self = {
	    send_keep_alive: function() {
	        var xmlhttp = new XMLHttpRequest();
	        xmlhttp.open("GET","/ping/",true);
	        xmlhttp.send();
	    },
	    
	    show_ssh_key: function () {
    		$.ajax({
    			url: "/hostupload/sshkey",
    			success: function(sshkey) {
    				bootbox.alert('<pre>' + sshkey.data + '</pre>');
    			},
    			error: function() {
    				bootbox.alert("Oops. Unexpected error while retrieving the ssh key.<br/><br/>Please try again later.");
    			}
    		});	    	
	    },
	    
		do_upgrade: function () {
    		$.ajax({
    			url: "/hostadmin/",
    			data: { 'upgrade_id' : 'me' },
    			success: function(res) {
    				if(res.code == 0) {
    					bootbox.alert('Upgrade initiated. You have been logged out. Press Ok to log in again and complete the upgrade.', function(){
    						top.location.href = '/';
    					});    					
    				}
    				else {
    					bootbox.alert('Oops. Unexpected error while upgrading.<br/><br/>Please try again later.');
    				}
    			},
    			error: function() {
    				bootbox.alert("Oops. Unexpected error while upgrading.<br/><br/>Please try again later.");
    			}
    		});
		},
		
		init_gauth_tok: function(tok) {
			_gauth = tok;
		},
		
		register_jquery_folder_field: function (fld, trig, loc) {
			jqfld = $('#filesync-frame').contents().find(fld);
			jqtrig = $('#filesync-frame').contents().find(trig);
			jqloc = $('#filesync-frame').contents().find(loc);
			jqfld.change(function() {
        		parts = jqfld.val().split('/');
        		if(parts.length > 3) {
        			jqloc.val(parts[2]);
        		}
        		else {
        			jqloc.val('');
        		}
            });
			jqfld.prop('readonly', true);
			jqfld.gdrive('set', {
    			'trigger': jqtrig, 
    			'header': 'Select a folder to synchronize',
    			'filter': 'application/vnd.google-apps.folder'
			});
		},

		sync_addgit: function(repo, loc, branch) {
			repo = repo.trim()
			loc = loc.trim()
			branch = branch.trim()
			if(repo.length == 0) {
				return;
			}
			self.inpage_alert('info', 'Adding repository...');
    		$.ajax({
    			url: "/hostupload/sync",
    			type: 'POST',
    			data: {'action': 'addgit', 'repo': repo, 'loc': loc, 'branch': branch},
    			success: function(res) {
					$('#filesync-frame').attr('src', '/hostupload/sync');
    				if(res.code == 0) {
    					self.inpage_alert('success', 'Repository added successfully');
    				}
    				else if(res.code == 1) {
    					self.inpage_alert('warning', 'Repository added successfully. Pushing changes to remote repository not supported with HTTP URLs.');
    				}
    				else {
    					self.inpage_alert('danger', 'Error adding repository');
    				}
    			},
    			error: function() {
    				self.inpage_alert('danger', 'Error adding repository.');
    			}
    		});			
		},

		sync_addgdrive: function(repo, loc) {
			repo = repo.trim()
			loc = loc.trim()
			if(repo.length == 0) {
				return;
			}
			self.inpage_alert('info', 'Adding repository...');
    		$.ajax({
    			url: "/hostupload/sync",
    			type: 'POST',
    			data: {'action': 'addgdrive', 'repo': repo, 'loc': loc, 'gauth': _gauth},
    			success: function(res) {
					$('#filesync-frame').attr('src', '/hostupload/sync');
    				if(res.code == 0) {
    					self.inpage_alert('success', 'Repository added successfully');
    				}
    				else {
    					self.inpage_alert('danger', 'Error adding repository');
    				}
    			},
    			error: function() {
    				self.inpage_alert('danger', 'Error adding repository.');
    			}
    		});			
		},

		sync_syncgit: function(repo) {
			self.inpage_alert('info', 'Synchronizing repository...');
    		$.ajax({
    			url: "/hostupload/sync",
    			type: 'POST',
    			data: {'action': 'syncgit', 'repo': repo},
    			success: function(res) {
    				if(res.code == 0) {
    					self.inpage_alert('success', 'Repository synchronized successfully');
    				}
    				else if(res.code == 1) {
    					self.inpage_alert('warning', 'Repository synchronized with some conflicts');
    				}
    				else {
    					self.inpage_alert('danger', 'Error synchronizing repository');
    				}
    			},
    			error: function() {
    				self.inpage_alert('danger', 'Error synchronizing repository.');
    			}
    		});			
		},

		sync_syncgdrive: function(repo) {
			self.inpage_alert('info', 'Synchronizing repository...');
    		$.ajax({
    			url: "/hostupload/sync",
    			type: 'POST',
    			data: {'action': 'syncgdrive', 'repo': repo, 'gauth': _gauth},
    			success: function(res) {
    				if(res.code == 0) {
    					self.inpage_alert('success', 'Repository synchronized successfully');
    				}
    				else {
    					self.inpage_alert('danger', 'Error synchronizing repository');
    				}
    			},
    			error: function() {
    				self.inpage_alert('danger', 'Error synchronizing repository.');
    			}
    		});
		},

		sync_delgit: function(repo) {
			self.inpage_alert('warning', 'Deleting repository...');
    		$.ajax({
    			url: "/hostupload/sync",
    			type: 'POST',
    			data: {'action': 'delgit', 'repo': repo},
    			success: function(res) {
    				$('#filesync-frame').attr('src', '/hostupload/sync');
    				if(res.code == 0) {
    					self.inpage_alert('success', 'Repository deleted successfully');
    				}
    				else {
    					self.inpage_alert('danger', 'Error deleting repository');
    				}
    			},
    			error: function() {
    				self.inpage_alert('danger', 'Error deleting repository.');
    			}
    		});			
		},

		sync_delgdrive: function(repo) {
			self.inpage_alert('warning', 'Deleting repository...');
    		$.ajax({
    			url: "/hostupload/sync",
    			type: 'POST',
    			data: {'action': 'delgdrive', 'repo': repo, 'gauth': _gauth},
    			success: function(res) {
    				$('#filesync-frame').attr('src', '/hostupload/sync');
    				if(res.code == 0) {
    					self.inpage_alert('success', 'Repository deleted successfully');
    				}
    				else {
    					self.inpage_alert('danger', 'Error deleting repository');
    				}
    			},
    			error: function() {
    				self.inpage_alert('danger', 'Error deleting repository.');
    			}
    		});			
		},
		
		sync_delgit_confirm: function(repo) {
			self.popup_confirm('Are you sure you want to delete this repository?', function(res) {
				if(res) {
					self.sync_delgit(repo);
				}
			});
	    },
		
		sync_delgdrive_confirm: function(repo) {
			self.popup_confirm('Are you sure you want to delete this repository?', function(res) {
				if(res) {
					self.sync_delgdrive(repo);
				}
			});
	    },
		
		init_inpage_alert: function (msg_body, msg_div) {
			_msg_body = msg_body;
			_msg_div = msg_div;
		},

    	inpage_alert: function (msg_level, msg_body) {
    		if(null == _msg_body) return;
    		
    		_msg_body.html(msg_body);
    		_msg_div.removeClass("alert-success alert-info alert-warning alert-danger");
    		_msg_div.addClass("alert-"+msg_level);
    		_msg_div.show();
    	},

		popup_alert: function(msg, fn) {
			bootbox.alert(msg, fn);
		},
		
		popup_confirm: function(msg, fn) {
			bootbox.confirm(msg, fn);
		},
	};
	
	return self;
})();

