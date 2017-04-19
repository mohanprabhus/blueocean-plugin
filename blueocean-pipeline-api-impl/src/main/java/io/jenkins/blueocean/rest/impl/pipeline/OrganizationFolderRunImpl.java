package io.jenkins.blueocean.rest.impl.pipeline;

import com.cloudbees.hudson.plugins.folder.computed.FolderComputation;
import hudson.model.Cause;
import hudson.model.CauseAction;
import io.jenkins.blueocean.rest.Reachable;
import io.jenkins.blueocean.rest.hal.Link;
import io.jenkins.blueocean.rest.model.BlueActionProxy;
import io.jenkins.blueocean.rest.model.BlueArtifactContainer;
import io.jenkins.blueocean.rest.model.BlueChangeSetEntry;
import io.jenkins.blueocean.rest.model.BluePipelineNodeContainer;
import io.jenkins.blueocean.rest.model.BluePipelineStepContainer;
import io.jenkins.blueocean.rest.model.BlueRun;
import io.jenkins.blueocean.rest.model.Container;
import io.jenkins.blueocean.service.embedded.rest.LogResource;
import io.jenkins.blueocean.service.embedded.rest.QueueItemImpl;
import org.kohsuke.stapler.QueryParameter;

import java.util.Collection;
import java.util.Date;

/**
 * @author Vivek Pandey
 */
public class OrganizationFolderRunImpl extends BlueRun {

    /*
     * OrganizationFolder can be only replayed once created. That means it has only one run, hence run id 1
     */
    static final String RUN_ID = "1";

    private final OrganizationFolderPipelineImpl pipeline;
    private final Link self;
    private final FolderComputation folderComputation;


    public OrganizationFolderRunImpl(OrganizationFolderPipelineImpl pipeline, Reachable parent) {
        this.pipeline = pipeline;
        this.folderComputation = pipeline.folder.getComputation();
        this.self = parent.getLink().rel(RUN_ID);
    }

    @Override
    public Link getLink() {
        return self;
    }

    @Override
    public String getOrganization() {
        return pipeline.getOrganization();
    }

    @Override
    public String getId() {
        return RUN_ID;
    }

    @Override
    public String getPipeline() {
        return pipeline.getName();
    }

    @Override
    public Date getStartTime() {
        return folderComputation.getTimestamp().getTime();
    }

    @Override
    public Container<BlueChangeSetEntry> getChangeSet() {
        return null;
    }

    @Override
    public Date getEnQueueTime() {
        return getStartTime();
    }

    @Override
    public Date getEndTime() {
        return null;
    }

    @Override
    public Long getDurationInMillis() {
        if(folderComputation.isBuilding()){
            return (System.currentTimeMillis() - folderComputation.getTimestamp().getTimeInMillis());
        }
        return getEstimatedDurtionInMillis(); //TODO: FolderComputation doesn't expose duration as date/time value. For now we return estimatedDuration. Raise this issue.

    }

    @Override
    public Long getEstimatedDurtionInMillis() {
        return folderComputation.getEstimatedDuration();
    }

    @Override
    public BlueRunState getStateObj() {
        return folderComputation.isBuilding()? BlueRunState.RUNNING : BlueRunState.FINISHED;
    }


    @Override
    public BlueRunResult getResult() {
        return folderComputation.getResult() != null
                ? BlueRun.BlueRunResult.valueOf(folderComputation.getResult().toString())
                : BlueRunResult.UNKNOWN;
    }

    @Override
    public String getRunSummary() {
        return String.format("%s:%s",getResult(), getStateObj());
    }

    @Override
    public String getType() {
        return FolderComputation.class.getName();
    }

    @Override
    public BlueRun stop(@QueryParameter("blocking") Boolean blocking, @QueryParameter("timeOutInSecs") Integer timeOutInSecs) {
        return null;
    }

    @Override
    public String getArtifactsZipFile() {
        return null;
    }

    @Override
    public BlueArtifactContainer getArtifacts() {
        return null;
    }

    @Override
    public BluePipelineNodeContainer getNodes() {
        return null;
    }

    @Override
    public Collection<BlueActionProxy> getActions() {
        return null;
    }

    @Override
    public BluePipelineStepContainer getSteps() {
        return null;
    }

    @Override
    public Object getLog() {
        return new LogResource(folderComputation.getLogText());
    }

    @Override
    public String getCauseOfBlockage() {
        return null;
    }

    @Override
    public BlueRun replay() {
        if(pipeline.folder.isBuildable()) {
            return new QueueItemImpl(pipeline.folder.scheduleBuild2(0,new CauseAction(new Cause.UserIdCause())), pipeline, 1).toRun();
        }
        return null;
    }
}
